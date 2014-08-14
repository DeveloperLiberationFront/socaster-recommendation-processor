var _ = require("lodash");
var Promise = require('bluebird');
var mongojs = Promise.promisifyAll(require('mongojs'));

var url = "eve:api service access@localhost/socaster";
var collections = ["users", "tools", "recommendations", "user_tools"];
var db = mongojs.connect(url, collections);

db.flatten = function(collection) {
  return collection.findAsync().map(function(item) {
    if (item.value) {
      collection.update({_id: item._id}, item.value);
    }
  }).all();
}

module.exports = db;