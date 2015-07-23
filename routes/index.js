var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/test/:test_id', function(req, res, next) {
  res.render('app');
});

router.get('/test/:test_id/start', function(req, res, next) {
  res.render('app');
});

router.get('/test/:test_id/editor', function(req, res, next) {
  res.render('app');
});

router.get('/test-session/:testSession_id', function(req, res, next) {
  res.render('app');
});

router.get('/test-complete/:testSession_id', function(req, res, next) {
  res.render('app');
});


module.exports = router;
