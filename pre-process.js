var _ = require("lodash");
var Promise = require('bluebird');
var db = require("./db");

db.user_tools.remove();
db.recommendations.remove(); //might as well start fresh