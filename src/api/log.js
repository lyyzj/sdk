'use strict'

var debug = require('debug')('shinezone-js-sdk-module-verify');

var pf = require("../platform"); 

function Log(cpId, cpKey, url) {
  this.platform = new pf(cpId, cpKey, url);
}

Log.prototype.getAccessToken = function() {
  return this.platform.getAccessToken();
}

Log.prototype.sendLog = function(token, contents) {
  return this.platform.sendLog(token, contents);
}

module.exports = Log;
