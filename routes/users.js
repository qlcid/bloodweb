var express = require('express');
var router = express.Router();
var passport = require('passport');
var url = require('url');

const { User } = require('../models');

// 로그인 라우터
router.get('/login', function (req, res, next) {
  res.render('login_form');
});

// passport로 local 로그인 처리
router.post('/login_do', passport.authenticate('local', {
  failureRedirect: '/users/login?login=fail',
}), (req, res, next) => {
  res.render('main', Object.assign(req.user, {
     register: false, 
     logged: true,
     login: true
    }));
});

// 로그아웃 라우터
router.get('/logout', function (req, res, next) {
  req.logout();
  res.render('main', {
     register: false, 
     logged: false,
     login: false
     });
});

// 마이페이지 라우터
router.get('/mypage', function (req, res, next) {
  res.render('mypage', Object.assign(req.user, {
      register: null, 
      logged: true,
      login: null
    })); 
});

// 개인 회원가입 라우터
router.get('/register_personal', function (req, res, next) {
  res.render('register_personal_form', {
    register: false, 
    logged: false, 
    login: false
  });
});

// 재단 회원가입 라우터
router.get('/register_foundation', function (req, res, next) {
  res.render('register_foundation_form',{
    register: false, 
    logged: false,
    login:false
  });
});

// db 연동 회원가입 처리. 개인, 재단 모두 처리
router.post('/register_do', function (req, res, next) {

  var duplicated=false;
  if(req.body.flag == 0)
    distinction = 'personal';
  else
    distinction = 'foundation';
  // 아이디, 닉네임 중복 검사
  User.findAll({
    attributes: ['user_id', 'nickname'],
  }).then(function (result) {
    result.forEach(element => {
      // db 아이디, 닉네임 값
      var data = element.dataValues;
      var user_id_db = data.user_id;
      var nickname_db = data.nickname;

      // 폼 입력값
      var user_id = req.body.user_id;
      var user_pwd = req.body.user_pwd;
      var user_name = req.body.user_name;
      var nickname = req.body.nickname;
      var business_license_num = req.body.flag == 1 ? req.body.business_license_num : null;

      // 아이디 중복일 경우 아이디 제외한 입력값과 함께 회원가입창으로 복귀
      if (user_id == user_id_db) {
        duplicated = true;
        res.render('register_' + distinction + '_form', {
          register: 'fail_id',
          user_pwd: user_pwd,
          user_name: user_name,
          nickname: nickname,
          business_license_num: business_license_num
        });
      }
      // 닉네임 중복일 경우 닉네임 제외한 입력값과 함께 회원가입창으로 복귀
      if (nickname == nickname_db) {
        duplicated = true;
        res.render('register_' + distinction + '_form', {
          register:'fail_nickname',
          user_id: user_id,
          user_pwd: user_pwd,
          user_name: user_name,
          business_license_num: business_license_num
        });
      }
    });
  }).then(function () { // node.js 비동기 처리 위해 위처럼 따로 User.create 안하고 then 씀.
    // duplicated == false일 때(중복 아닐때) db에 저장
    if (duplicated == false) {
      User.create({
        user_id: req.body.user_id,
        user_pwd: req.body.user_pwd,
        flag: req.body.flag == 1 ? true : false,
        business_license_num: req.body.flag == 1 ? req.body.business_license_num : null,
        user_name: req.body.user_name,
        nickname: req.body.nickname,

      }).then(function (User) {
        console.log('success');
      }).catch(function (err) {
        console.log(err);
      });
      res.render('main', {
        register:"success", 
        logged: false,
        login: false
      });
    }
  }).catch(function (err) {
    console.log(err);
  });



});

module.exports = router;
