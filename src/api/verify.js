'use strict'

var debug = require('debug')('shinezone-js-sdk-module-verify');

var pf = require("../platform"); 

function Verify(cpId, cpKey, url) {
  this.platform = new pf(cpId, cpKey, url);
}

Verify.prototype.getCaptcha = function() {
  return this.platform.getCaptcha();
}

Verify.prototype.verifyCaptcha = function(code, identity) {
  return this.platform.verifyCaptcha(code, identity);
}

Verify.prototype.sendMailVerify = function(email) {
  return this.platform.sendMailVerify(email);
}

Verify.prototype.verifyMailCode = function(code, secretKey, sendTime) {
  return this.platform.verifyMailCode(code, secretKey, sendTime);
}

Verify.prototype.sendMobileVerify = function(mobile) {
  return this.platform.sendMobileVerify(mobile);
}

Verify.prototype.verifyMobileCode = function(code, secretKey, sendTime) {
  return this.platform.verifyMobileCode(code, secretKey, sendTime);
}

module.exports = Verify;
