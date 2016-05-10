'use strict'

var debug = require('debug')('shinezone-js-sdk');

var User = require('./api/user');
var Misc = require('./api/misc');
var Verify = require('./api/verify');
var Log = require('./api/log');

function ShinezoneSDK(cpId, cpKey, apiUrl) {
  this.user = new User(cpId, cpKey, apiUrl);
  this.misc = new Misc(cpId, cpKey, apiUrl);
  this.verify = new Verify(cpId, cpKey, apiUrl);
  this.log = new Log(cpId, cpKey, apiUrl);
}


module.exports = ShinezoneSDK;
