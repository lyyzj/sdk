'use strict'

var debug = require('debug')('shinezone-js-sdk-api');
var Promise = require('bluebird');
var request = require('request');
var crypto = require('crypto');
var Joi = require('joi'); // lower case

var config = require('./config');
var utility = require('./utility');
var postAsync = Promise.promisify(request.post);


function platform(cpId, cpKey, url) {
  this.cpId = cpId;
  this.cpKey = cpKey;
  //if url missing, use config
  this.url = url || config.url + '/' + config.apiVersion;
  this.res = {
    data: {},
    message: '',
    status: 0
  };
}

/**
 * create request signature 
 */
platform.prototype.createSign = function(params) {
  var md5 = crypto.createHash('md5'); 
  params.unshift(this.cpId);
  params.push(this.cpKey);
  for (var i in params) {
    md5.update(params[i].toString());
  }
  var md5Str = md5.digest('hex');
  debug('md5 string %s', md5Str);
  
  return md5Str;
};

platform.prototype.getTimeStamp = function() {
  return Math.floor(Date.now() / 1000);
};

/**
 * check user name if exist 
 */
platform.prototype.checkName = function(name) {
  var url = this.url + '/user/check_name/';
  var signParams = [name];  
  var otherData = { name: name };
  var schema = {
    name: Joi.string().required()
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * check mobile if exist 
 * module user
 */
platform.prototype.checkMobile = function(mobile) {
  var _this = this;
  return new Promise(function(resolve, reject) {
    var schema = {
      mobile: Joi.string().required()
    };
    utility.joiValidate({ mobile: mobile }, schema)
    .then(function(val) {
      _this.checkName(mobile)
      .then(function(data) {
        resolve(data);    
      })
      .catch(function(err) {
        reject(err);
      });
    })
    .catch(function(err) {
      resolve(utility.getErr(_this.res, '9997'));
    });
  });
};

/**
 * check email if exist 
 * module user
 */
platform.prototype.checkEmail = function(email) {
  var _this = this;
  return new Promise(function(resolve, reject) {
    var schema = {
      email: Joi.string().email().required()
    };
    utility.joiValidate({ email: email }, schema)
    .then(function(val) {
      _this.checkName(email)
      .then(function(data) {
        resolve(data);    
      })
      .catch(function(err) {
        reject(err);
      });
    })
    .catch(function(err) {
      resolve(utility.getErr(_this.res, '9997'));
    });
  });
};

/**
 * register user
 * module user
 */
platform.prototype.userRegister = function(username, pwd) {
  var url = this.url + '/user/register/';
  var signParams = [username];  
  var otherData = { name: username, pwd: pwd };
  var schema = {
    name: Joi.string().required(),
    pwd:  Joi.string().required()
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * bind mobile or email 
 * module user
 */
platform.prototype.userSetBind = function(SzId, mobile, email) {
  var url = this.url + '/user/set_register_info/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id: SzId, mobile: mobile || '', email: email || '' };
  var schema = {
    sz_id:   Joi.string().required(),
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 *  bind mobile
 *  module user
 */
platform.prototype.userSetBindMobile = function(SzId, mobile) {
  var _this = this;
  return new Promise(function(resolve, reject) {
    var schema = {
      sz_id:  Joi.string().required(),
      mobile: Joi.string().max(15).required()
    };
    utility.joiValidate({ sz_id: SzId, mobile: mobile }, schema)
    .then(function(val) {
      _this.userSetBind(SzId, mobile)
      .then(function(data) {
        resolve(data);    
      })
      .catch(function(err) {
        reject(err);
      });
    })
    .catch(function(err) {
      resolve(utility.getErr(_this.res, '9997'));
    });
  });
};

/**
 * bind email
 * module user
 */
platform.prototype.userSetBindEmail = function(SzId, email) {
  var _this = this;
  return new Promise(function(resolve, reject) {
    var schema = {
      sz_id:  Joi.string().required(),
      email:  Joi.string().email().required()
    };
    utility.joiValidate({ sz_id: SzId, email: email }, schema)
    .then(function(val) {
      _this.userSetBind(SzId, '', email)
      .then(function(data) {
        resolve(data);    
      })
      .catch(function(err) {
        reject(err);
      });
    })
    .catch(function(err) {
      resolve(utility.getErr(_this.res, '9997'));
    });
  });
};

/**
 * user login
 * module user
 */
platform.prototype.userLogin = function(username, pwd) {
  var url = this.url + '/user/login/';
  var signParams = [username];  
  var otherData = { name: username, pwd: pwd };
  var schema = {
    name: Joi.string().required(),
    pwd:  Joi.string().required()
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * get captach code
 * module misc
 */
platform.prototype.getCaptcha = function() {
  var url = this.url + '/user/get_captcha/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = {};
  var schema = {};
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * verify captcha code
 * module misc
 */
platform.prototype.verifyCaptcha = function(code, identity) {
  var url = this.url + '/user/verify_captcha/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { cap_info: code, cap_code: identity };
  var schema = {
    cap_info:  Joi.string().required(),
    cap_code:  Joi.string().required()
  }
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * user update password
 * module user
 */
platform.prototype.userChangePwd = function(SzId, curPwd, newPwd) {
  var url = this.url + '/user/change_pwd/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id:SzId, pwd_retrieve: 'no', cur_pwd: curPwd, new_pwd: newPwd };
  var schema = {
    sz_id:       Joi.string().required(),
    cur_pwd:     Joi.string().required(),
    pwd_retrieve:Joi.string(),
    new_pwd:     Joi.string().required()
  }
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * user update password without old password
 * module user
 */
platform.prototype.userDirectChangePwd = function(SzId, newPwd) {
  var url = this.url + '/user/change_pwd/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id:SzId, pwd_retrieve: 'mobile', new_pwd: newPwd };
  var schema = {
    sz_id:       Joi.string().required(),
    pwd_retrieve:Joi.string(),
    new_pwd:     Joi.string().required()
  }
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);

};

/**
 * send email to verify 
 * module verify
 */
platform.prototype.sendMailVerify = function(email) {
  var url = this.url + '/user/send_mail_verify/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { email: email };
  var schema = {
    email: Joi.string().email().required()
  }
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
}

/**
 * verify mail code  
 * module verify
 */
platform.prototype.verifyMailCode = function(code, secretKey, sendTime) {
  var url = this.url + '/user/confirm_mail_verify/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { send_timestamp: sendTime, verifiable_code: code, secret_key: secretKey };
  var schema = {
    send_timestamp:  Joi.number().integer().required(),
    verifiable_code: Joi.string().required(),
    secret_key:      Joi.string().length(32, 'utf8').required()
  }
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * send mobile verify code 
 * module verify
 */
platform.prototype.sendMobileVerify = function(mobile) {
  var url = this.url + '/user/sms_mobile/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { mobile: mobile };
  var schema = {
    mobile:   Joi.string().required(),
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * verify mobile code 
 * module verify
 */
platform.prototype.verifyMobileCode = function(code, secretKey, sendTime) {
  var url = this.url + '/user/sms_mobile_verify/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { send_timestamp: sendTime, verifiable_code: code, secret_key: secretKey };
  var schema = {
    send_timestamp:  Joi.number().integer().required(),
    verifiable_code: Joi.string().required(),
    secret_key:      Joi.string().length(32, 'utf8').required()
  }
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * get post log's access token
 * module log
 */
platform.prototype.getAccessToken = function() {
  var _this = this;
  var url = _this.url + '/token/log/';
  var timestamp = _this.getTimeStamp();
  var signParams = [timestamp]; 

  return new Promise(function(resolve, reject) {
    var sign = _this.createSign(signParams);  
    var formData = {
      cp_id: _this.cpId,
      time: timestamp,
      sign: sign
    };
    debug(url + ' form data: ', formData);
    postAsync({
      url: url,
      form: formData
    })
    .then(function(response) {
      try {
        debug('get access token body:', response.body);
        var body = JSON.parse(response.body);
        _this.res.status = body.code;
        _this.res.data = { token: body.token };
        resolve(_this.res);
      } catch (e) {
        throw new Error('invalid json body!'); 
      }
    })
    .catch(function(err) {
      reject(utility.getErr(_this.res, '9999'));
    });
  });

};

/**
 *  post log
 *  module log
 */
platform.prototype.sendLog = function(token, contents) {
  var _this = this;
  var url = _this.url + '/log/';

  return new Promise(function(resolve, reject) {
    var formData = {
      access_token: token,
      contents:     contents 
    };
    var schema = {
      contents:        Joi.string().max(500).required(),
      access_token:    Joi.string().length(32, 'utf8').required()
    }
    utility.joiValidate(formData, schema)
    .then(function(val) {
        postAsync({
          url: url,
          form: formData
        })
        .then(function(response) {
          try {
            debug('send log body:', response.body);
            var body = JSON.parse(response.body);
            _this.res.status = body.code || body.result;
            resolve(_this.res);
          } catch (e) {
            throw new Error('invalid json body!'); 
          }
        })
        .catch(function(err) {
          reject(utility.getErr(_this.res, '9999'));
        });
    })
    .catch(function(err) {
      reject(utility.getErr(_this.res, '9997'));
    })
  });

};

/**
 * get user's info
 * module user
 */
platform.prototype.getUserinfo = function(SzId) {
  var url = this.url + '/user/get_user_info/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id: SzId };
  var schema = {
    sz_id: Joi.string().required(),
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);

};

/**
 * user set head icon 
 * module user
 */
platform.prototype.setUserIcon = function(SzId, icon) {
  var url = this.url + '/user/update_user_image/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id: SzId, head_icon: icon };
  var schema = {
    sz_id:     Joi.string().required(),
    head_icon: Joi.binary().encoding('base64')
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * user set base infomation
 * module user
 */
platform.prototype.setUserInfo = function(SzId, info) {
  var url = this.url + '/user/update_user_info/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var updateKey = ['nickname', 'country', 'sex', 'industry', 'occupation',
                   'education', 'income', 'postcode', 'address'];
  // check update key
  var keys = Object.keys(info);
  for (var i in keys) {
    if (updateKey.indexOf(keys[i]) < 0) {
      return Promise.reject('invalid update key in info schema!'); 
    }
  }
  var otherData = { sz_id: SzId, user_info: JSON.stringify(info) };
  var schema = {
    sz_id:     Joi.string().required()
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);


  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * send email to user's bind mail 
 * module user
 */
platform.prototype.userRequestBindMail = function(SzId, email, confirmUrl) {
  var url = this.url + '/user/bind_mail/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id: SzId, need_pwd: false, cover: true, mail_bind: email, bind_email_url: confirmUrl };
  var schema = {
    sz_id:     Joi.string().required(),
    mail_bind:Joi.string().email().required(),
    bind_email_url: Joi.string().required()
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);

};

/**
 * use confirm bind mail through link in email 
 * module user
 */
platform.prototype.userConfirmBindMail = function(SzId, email, secretKey) {
  var url = this.url + '/user/bind_mail_confirm/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id: SzId, guest: 0, mail_bind: email, secret_key: secretKey };
  var schema = {
    sz_id:      Joi.string().required(),
    mail_bind:  Joi.string().email().required(),
    secret_key: Joi.string().required()
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * user change mobile push status 
 * module user
 */
platform.prototype.userChangePush = function(SzId, push) {
  var url = this.url + '/user/change_mobile_push/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  if (push !== false) {
    push = push === true || push.toLowerCase() === 'true';
  }
  var otherData = { sz_id: SzId, mobile_push: push };
  var schema = {
    sz_id:     Joi.string().required(),
    mobile_push:Joi.boolean(),
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);

};

/**
 * set safe tip windows show's status 
 * module user
 */
platform.prototype.userSetSafetyTip = function(SzId, isTip) {
  var url = this.url + '/user/set_safety_info/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  if (isTip !== false) {
    isTip = isTip === true || isTip.toLowerCase() === 'true';
  }
  var otherData = { sz_id: SzId, safety_info: isTip };
  var schema = {
    sz_id:       Joi.string().required(),
    safety_info: Joi.boolean(),
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * get user's setted secutity infomation
 * module user
 */
platform.prototype.userGetSecurity = function(SzId) {
  var url = this.url + '/user/get_user_security/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id: SzId};
  var schema = {
    sz_id:       Joi.string().required(),
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * user set identity infomation 
 * module user
 */
platform.prototype.userUpdateIdentity = function(SzId, cardId, mobile) {
  var url = this.url + '/user/update_identity/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var subData = { card_id: cardId || '', mobile: mobile || '' };
  if (subData.card_id == '') {
    delete subData.card_id; 
  }
  if (subData.mobile == '') {
    delete subData.mobile; 
  }
  if (Object.keys(subData).length === 0) {
    return Promise.reject(utility.getErr(this.res, '9998'));
  }
  var otherData = { sz_id: SzId, identity: JSON.stringify(subData) };
  var schema = {
    sz_id:       Joi.string().required(),
    identity:    Joi.string()
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * use update security question 
 * module user
 */
platform.prototype.userUpdateQuestion = function(SzId, questions) {
  var url = this.url + '/user/update_security_question/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id: SzId, security_question: JSON.stringify(questions) };
  var schema = {
    sz_id:              Joi.string().required(),
    security_question:  Joi.string()
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * get question list by sz id, with country code  
 * module misc
 */
platform.prototype.getUserQuestions = function(SzId) {
  var url = this.url + '/user/get_question_list/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id: SzId};
  var schema = {
    sz_id:          Joi.string().required(),
  };
  var sign = this.createSign(signParams); 
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * get country code list 
 * module misc
 */
platform.prototype.getCountryCodes = function() {
  var url = this.url + '/user/get_country_code/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { timestamp: timestamp };
  var schema = {
    timestamp:  Joi.number().required(),
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * send sms, of course it send more mobile 
 * module misc
 */
platform.prototype.sendSms = function(mobiles, sendMsg) {
  var url = this.url + '/user/sms_send/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { mobiles: mobiles, send_msg: sendMsg };
  var schema = {
    mobiles: Joi.string().required(),
    send_msg:Joi.string().required()
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * record use login infomation 
 * module user
 */
platform.prototype.userSetLogin = function(SzId, ip, address) {
  var url = this.url + '/user/set_login_history/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id:SzId, ip: ip, address: address };
  var schema = {
    sz_id:   Joi.string().required(),
    ip:      Joi.string().ip({version: ['ipv4', 'ipv6'], cidr: 'optional'}).required(),
    address: Joi.string().required()
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * get use login history list 
 * module user
 */
platform.prototype.userLoginList = function(SzId, offset, limit) {
  var url = this.url + '/user/get_login_history/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id: SzId, offset: offset || 0, limit: limit || 10 };
  var schema = {
    sz_id:   Joi.string().required(),
    offset:  Joi.number().required(),
    limit:   Joi.number().min(1).max(100).required()
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * get user play game list
 * module user
 */
platform.prototype.getUserGames = function(SzId) {
  var url = this.url + '/user/get_games/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id: SzId };
  var schema = {
    sz_id:  Joi.string().required(),
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * recommend game to user 
 * module user
 */
platform.prototype.getRecommendGames = function(SzId) {
  var url = this.url + '/user/get_app_recommend/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id: SzId };
  var schema = {
    sz_id:  Joi.string().required(),
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * get app label list
 * module misc
 */
platform.prototype.getAppLabels = function() {
  var url = this.url + '/user/get_app_labels/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { timestamp: timestamp };
  var schema = {
    timestamp:  Joi.number().required(),
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * set user's app lable
 * module user
 */
platform.prototype.setUserAppLabels = function(SzId, labels) {
  var url = this.url + '/user/update_user_app_labels/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id: SzId, app_labels: JSON.stringify(labels) };
  var schema = {
    sz_id:  Joi.string().required(),
    app_labels: Joi.string().required()
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * get language list
 * module misc
 */
platform.prototype.getLangList = function() {
  var url = this.url + '/user/get_languages/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = {};
  var schema = {};
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};

/**
 * set user selected language 
 * module user
 */
platform.prototype.setUserLang = function(SzId, lang) {
  var url = this.url + '/user/set_language/';
  var timestamp = this.getTimeStamp();
  var signParams = [timestamp]; 
  var otherData = { sz_id: SzId, language: lang };
  var schema = {
    sz_id:    Joi.string().required(),
    language: Joi.string().required()
  };
  var sign = this.createSign(signParams);  
  var formData = utility.buildData(this.cpId, sign, timestamp, otherData);

  return this.handleRequest(url, otherData, schema, formData);
};


platform.prototype.handleRequest = function(url, schemaData, schema, formData) {
  var _this = this;
  debug(url + ' form data: ', formData);
  return new Promise(function(resolve, reject) {
    utility.joiValidate(schemaData, schema, { allowUnknown: true })
    .then(function(val) {
      postAsync({
        url: url,
        form: formData
      })
      .then(function(response) {
        debug(url + ' body : ', response.body);
        try {
          var body = JSON.parse(response.body);
          _this.res.status = body.code;
          delete body.code;
          delete body.timestamp;
          delete body.msg;
          _this.res.data = body;
          resolve(_this.res);
        } catch (e) {
          throw new Error('invalid json body!'); 
        }

      })
      .catch(function(err) {
        reject(utility.getErr(_this.res, '9999'));
      });
    })
    .catch(function(err) {
      resolve(utility.getErr(_this.res, '9998'));
    })
  });
}

module.exports = platform;
