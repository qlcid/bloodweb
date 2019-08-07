var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.user == undefined)
    res.render('main', {
      register:null, 
      logged:false,
      login:null
    });
  else
    res.render('main', Object.assign(req.user, {
      register:null, 
      logged:true,
      login:null
    })); 
});

// router.get('/', function(req, res, next) {
//   res.render('main', Object.assign(req.user, {register:null}));
// });

router.get('/test', function(req, res, next) {
  res.render('test');
});
module.exports = router;
