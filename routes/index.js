var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Preinterview Test' });
});

/* GET application page. */
router.get('/test/:test_id', function(req, res, next) {
  res.render('app', { title: 'Preinterview Test' });
});


module.exports = router;
