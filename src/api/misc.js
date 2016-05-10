'use strict'

var debug = require('debug')('shinezone-js-sdk-module-misc');

var pf = require("../platform"); 

function Misc(cpId, cpKey, url) {
  this.platform = new pf(cpId, cpKey, url);
}

Misc.prototype.getQuestionList = function(SzId) {
  return this.platform.getUserQuestions(SzId);
}

Misc.prototype.getCountryCodes = function() {
  return this.platform.getCountryCodes();
}

Misc.prototype.sendSms = function(mobiles, sendMsg) {
  return this.platform.sendSms(mobiles, sendMsg);
}

Misc.prototype.getAppLabels = function() {
  return this.platform.getAppLabels();
}

Misc.prototype.getLangList = function() {
  return this.platform.getLangList();
}

module.exports = Misc;
