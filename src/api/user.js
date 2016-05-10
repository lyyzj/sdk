'use strict'

var debug = require('debug')('shinezone-js-sdk-module-user');

var pf = require("../platform"); 

function User(cpId, cpKey, url) {
  this.platform = new pf(cpId, cpKey, url);
}

User.prototype.checkEmail = function(email) {
  return this.platform.checkEmail(email);
}

User.prototype.checkMobile = function(mobile) {
  return this.platform.checkMobile(mobile);
}

User.prototype.register = function(username, pwd) {
  return this.platform.userRegister(username, pwd);
}

User.prototype.setBind = function(SzId, mobile, email) {
  return this.platform.userSetBind(SzId, mobile, email);
}

User.prototype.setBindMobile = function(SzId, mobile) {
  return this.platform.userSetBindMobile(SzId, mobile);
}

User.prototype.setBindEmail = function(SzId, email) {
  return this.platform.userSetBindEmail(SzId, email);
}

User.prototype.updatePwd = function(SzId, curPwd, newPwd) {
  return this.platform.userChangePwd(SzId, curPwd, newPwd);
}
 
User.prototype.directUpdatePwd = function(SzId, newPwd) {
  return this.platform.userDirectChangePwd(SzId, newPwd);
}

User.prototype.getInfo = function(SzId) {
  return this.platform.getUserinfo(SzId);
}

User.prototype.setIcon = function(SzId, icon) {
  return this.platform.setUserIcon(SzId, icon);
}

User.prototype.setInfo = function(SzId, info) {
  return this.platform.setUserInfo(SzId, info);
}

User.prototype.requestBindMail = function(SzId, email, confirmUrl) {
  return this.platform.userRequestBindMail(SzId, email, confirmUrl);
}

User.prototype.confirmBindMail = function(SzId, email, secretKey) {
  return this.platform.userConfirmBindMail(SzId, email, secretKey);
}

User.prototype.changePush = function(SzId, push) {
  return this.platform.userChangePush(SzId, push);
}

User.prototype.setSafetyTip = function(SzId, isTip) {
  return this.platform.userSetSafetyTip(SzId, isTip);
}

User.prototype.getSecurityList = function(SzId) {
  return this.platform.userGetSecurity(SzId);
}

User.prototype.updateIdentity = function(SzId, cardId, mobile) {
  return this.platform.userUpdateIdentity(SzId, cardId, mobile);
}

User.prototype.updateQuestion = function(SzId, questions) {
  return this.platform.userUpdateQuestion(SzId, questions);
}

User.prototype.setLoginInfo = function(SzId, ip, address) {
  return this.platform.userSetLogin(SzId, ip, address);
}

User.prototype.loginHistory = function(SzId, offset, limit) {
  return this.platform.userLoginList(SzId, offset, limit);
}

User.prototype.recommendGames = function(SzId) {
  return this.platform.getRecommendGames(SzId);
}

User.prototype.setAppLabels = function(SzId, labels) {
  return this.platform.setUserAppLabels(SzId, labels);
}

User.prototype.getPlayGames = function(SzId) {
  return this.platform.getUserGames(SzId);
}

User.prototype.setLang = function(SzId, lang) {
  return this.platform.setUserLang(SzId, lang);
}

module.exports = User;
