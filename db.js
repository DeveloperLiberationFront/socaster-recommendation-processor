var _ = require("lodash");
var Promise = require('bluebird');
var mongojs = Promise.promisifyAll(require('mongojs'));

var url = "eve:api service access@localhost/socaster";
var collections = [
  "applications",
  "clips",
  "copy_tools",
  "events",
  "fs.chunks",
  "fs.files",
  "images",
  "log",
  "notifications",
  "ratings",
  "recommendations",
  "system.indexes",
  "system.users",
  "test",
  "tools",
  "usages",
  "user_tools",
  "users",
  "yammer_tokens"
];
var db = mongojs.connect(url, collections);

module.exports = db;