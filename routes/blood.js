var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');

const { User, Bdcard, Reqboard } = require('../models');

// 헌혈증 등록    main화면에서 헌혈증 등록하러가기 >> 버튼
router.get('/blood_register', function (req, res, next) {
    if(req.user)
      res.render('blood_register_form', Object.assign(req.user, { register: null }));

});

// 헌혈증 등록 처리
router.post('/blood_register_do', function (req, res, next) {
  var duplicated = false;

  // 헌혈증 중복 검사
  Bdcard.findAll({
    attributes: ['serial_number'],
  }).then(function (result) {
    result.forEach(element => {
      data = element.dataValues;
      serial_number = data.serial_number;
      if (req.body.bnum == serial_number) {
        duplicated = true;
        res.render('blood_register_form', { register: "fail"});
      }

    });
  }).then(function () { // node.js 비동기 처리 위해 위처럼 따로 User.create 안하고 then 씀.
    // duplicated == false일 때(중복 아닐때) db에 저장
    if (duplicated == false) {
      Bdcard.create({
        serial_number: req.body.bnum,
        blood_date: req.body.bdate,
        blood_dona_type: req.body.btype,
        blood_bank_name: req.body.bname,
        owner_id: req.body.owner_id,

      }).then(function (Bdcard) {
        console.log('success');
        req.user.bdcard_count += 1;
        User.update({
          bdcard_count: req.user.bdcard_count,
        }, {
          where: { user_id: req.body.owner_id },
        }).then(function(User){

          res.render('blood_register_form', {register: "success"})
        }).catch(function(err){
          console.log(err);
        })

      }).catch(function (err) {
        console.log(err);
      });
    }
  }).catch(function (err) {
    console.log(err);
  });
});


// 마이페이지 - 내 기부요청 관리 라우터
router.get('/my_blood_request', function (req, res, next) {
  Reqboard.findAll({
    include: [
      {model: User, required: true},
    ]
  }).then(function (reqboards) {
    var result = {};
    if (req.user) {
      Object.assign(result, req.user);
    }
    Object.assign(result, { register: false });
    if (reqboards) {
      Object.assign(result, { reqboards: reqboards });
    }
     res.render('my_blood_request', result);
  }).catch(function (err) {
    console.log(err);
  });
});


// 헌혈증 기부, 기부요청목록, 기부요청 메인화면    main화면에서 기부하러/받으러 가기 >> 버튼 
router.get('/blood_donation_main', function (req, res, next) {
  Reqboard.findAll({
    order: [['reg_date', 'DESC']],
    include: [
      {model: User, required: true},
    ]
  }).then(function (reqboards) {
    var result = {};
    if (req.user) {
      Object.assign(result, req.user);
    }
    Object.assign(result, { register: false });
    if (reqboards) {
      Object.assign(result, { reqboards: reqboards });
    }
     res.render('blood_donation_main', result);
  }).catch(function (err) {
    console.log(err);
  });
  
});

// 헌혈증 기부요청   main화면에서 기부요청글 올리기 >> 버튼 
router.get('/blood_request', function (req, res, next) {

  res.render('blood_request_form', req.user);
});

// 헌혈증 기부요청 처리
router.post('/blood_request_do', function (req, res, next) {

  Reqboard.create({
    diagnosis: req.body.diagnosis,
    title: req.body.title,
    need_count: req.body.need_count,
    story: req.body.story,
    used_place: req.body.used_place,
    req_user_id: req.body.req_user_id,
  }).then(function () {
    console.log('success');

    Reqboard.findAll({
      order: [['reg_date', 'DESC']],
      include: [
        {model: User, required: true},
      ]
    }).then(function (reqboards) {
      var result = {};
      Object.assign(result, req.user);
      Object.assign(result, { register: "success" });
      if (reqboards) {
        Object.assign(result, { reqboards: reqboards });
      }
      res.render('blood_donation_main', result);
    }).catch(function (err) {
      console.log(err);
    })

  }).catch(function (err) {
    console.log(err);
  });
});

//헌혈증 기부 처리
router.post('/blood_donation', function (req, res, next) {
  var donate_count = Number(req.body.donate_count);
  var donated_count = Number(req.body.donated_count);
  var need_count = Number(req.body.need_count);
  var req_user_id = req.body.req_user_id;
  var used_place = req.body.used_place;
  var id = req.body.id;
  var req_donated_bdcard_count = Number(req.body.req_donated_bdcard_count);
  var user_bdcard_count = Number(req.body.user_bdcard_count);

  var donater = req.user.user_id;
  
  // 기부자 헌혈증 개수 감소, 기부 개수 증가 
  req.user.bdcard_count -= donate_count;
  user_bdcard_count -= donate_count;
  req.user.dona_count += donate_count;

  User.update({
    bdcard_count: user_bdcard_count,
    dona_count: req.user.dona_count
  },{
      where: { user_id: donater }
  }).catch(function (err) {
    console.log(err);
  })

  // 기부 요청자 헌혈증 개수 증가
  User.update({
    donated_bdcard_count: req_donated_bdcard_count + donate_count
  },{
      where: { user_id: req_user_id }
  }).catch(function (err) {
    console.log(err);
  })

  // 가장 오래된 헌혈증 순으로 기부 개수만큼 가져와서 소유자, 기부날짜, 사용될 병원, 기부자 등 값들 update (기부 수행)
  Bdcard.findAll({
    order: [['reg_date', 'ASC']],
    limit: donate_count,
    where: {
      is_donated: false,
      owner_id: donater
    }
  }).then(function (bdcards) {
    
    bdcards.forEach(function (element) {
      element.update({
        //dona_date: '2020-20-20',
        is_donated: true,
        used_place: used_place,
        donater: donater,
        donated_req_id: id,
        owner_id: req_user_id,
      }, {
          where: { serial_number: element.serial_number},
      }).catch(function (err) {
        console.log(err);
      })
    })
  }).catch(function (err) {
    console.log(err);
  });

  // 기부요청의 기부 개수 상태 업데이트
  var donated_count_update = donate_count + donated_count;
  var need_more = need_count - donated_count_update;
  if(need_count == donated_count_update)
    var is_finished = true;
  else
    var is_finished = false;
  Reqboard.update({
    donated_count: donated_count_update,
    is_finished: is_finished,
  },{
    where: {id: id},
  }).then(function(re){
    res.send(Object.assign(req.user, {
      user_bdcard_count: user_bdcard_count,
      donated_count: donated_count_update, 
      need_more: need_more, 
      is_finished: is_finished
    }));
  }).catch(function(err){
    console.log(Err);
  })
  
})

// 헌혈증 기부내역 확인    main화면에서 기부내역 확인하러가기 >> 버튼 
router.get('/blood_history', function (req, res, next) {
  res.render('blood_history', req.user);
});

module.exports = router;
