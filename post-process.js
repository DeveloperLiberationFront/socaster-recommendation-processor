var _ = require("lodash");
var Promise = require('bluebird');
var db = require("./db");

db.user_tools.remove();

function reduce(key, values) {
  var result = {};
  values.forEach(function(value) {
    var field;
    for (field in value) {
      if (value.hasOwnProperty(field) && value[field] && value[field].length != 0) {
        if (result[field] instanceof Array) {
          result[field] = result[field].concat(value[field]);
        } else {
          result[field] = value[field];
        }
      }
    }
  });
  return result;
}

var toolPromise = db.users.findAsync().then(function(users) {
  function mapTools() {
    var values = {
      name: this.name,
      application: this.application,
      users: this.users,
      recommendations: []
    }
    id = this._id;
    users.forEach(function(user) {
      emit({_id: id, user: user.email}, values);
    });
  }
  return db.tools.mapReduceAsync(mapTools, reduce, {
          out: {reduce: "user_tools"},
          scope: {users: users}}); //make sure map function can access users
});

function mapRecs() {
  var values = {
      name: null,
      application: null,
      users: null,
      recommendations: [{
        rank: this.rank,
        algorithm_type: this.algorithm_type,
        reason_value: this.reason_value
      }]
  }
  if (this.rank) {
      emit({_id: this.command_id, user: this.user_id}, values);
  }
}

function simplifyIds(collection) {
  //combine flattening with id simplification
  return collection.findAsync().map(function(item) {
    complexId = item._id
    collection.remove({_id: complexId});
    delete item._id;
    if (item.value) {
      item = item.value
    }
    item.tool_id = complexId._id;
    item.user = complexId.user;
    collection.insert(item);
  }).all();
}

toolPromise.then(function() {
  var p = db.recommendations.mapReduceAsync(mapRecs, reduce, {out: {reduce: "user_tools"}});
  p.delay(1000).then(function(){ 
    return simplifyIds(db.user_tools);
  }).then(function(){
    //console.log("Finished");
    db.close();
  });
});