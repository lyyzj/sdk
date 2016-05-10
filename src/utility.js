'use strict'

var Promise = require("bluebird");
var Joi = require("joi");
var config = require("./config");

function getErr(res, code) {
  var error = config.error;
  if (error.hasOwnProperty(code) === false) {
    res.message = "error code undefined!";
  } else {
    res.message = error[code];
  }
  res.status = code;

  return res;
}

function buildData(cpId, sign, timestamp, params) {
  params = params || {};
  if (typeof timestamp  === 'object') {
    params = timestamp;
    timestamp = Math.floor(Date.now() / 1000);
  }
  var data = {
    cp_id: cpId,
    timestamp: timestamp,
    sign: sign
  };
   
  return Object.assign(data, params);
}


module.exports = {
  getErr: getErr,
  buildData: buildData,
  joiValidate: Promise.promisify(Joi.validate)
}
