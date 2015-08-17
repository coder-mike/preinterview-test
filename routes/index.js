var express = require('express');
var router = express.Router();
var db = require('../db.js');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


router.get('/job-seekers', function(req, res, next) {
  res.render('job-seekers', { activeTab: 'job-seekers' });
});

router.get('/for-employers', function(req, res, next) {
  res.render('for-employers', { activeTab: 'for-employers' });
});

router.get('/request-quote', function(req, res, next) {
  res.render('request-quote', { activeTab: 'for-employers' });
});

router.post('/post-quote', function(req, res, next) {
  var doc = req.body;
  if (doc._id) delete doc._id;
  doc.type = "quote-request";

  db.insert(doc).then(function() {
    res.render('quote-posted', { activeTab: 'for-employers' });
  });
});

router.get('/test/:test_id', function(req, res, next) {
  res.render('app', { activeTab: 'job-seekers' });
});

router.get('/test/:test_id/start', function(req, res, next) {
  res.render('app', { activeTab: 'job-seekers' });
});

router.get('/test/:test_id/editor', function(req, res, next) {
  res.render('app', { activeTab: 'for-employers' });
});

router.get('/test-session/:testSession_id', function(req, res, next) {
  res.render('app', { activeTab: 'job-seekers' });
});

router.get('/test-complete/:testSession_id', function(req, res, next) {
  res.render('app', { activeTab: 'job-seekers' });
});


module.exports = router;
