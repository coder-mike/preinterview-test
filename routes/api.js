var express = require('express');
var router = express.Router();
var db = require('../db.js');

router.use(require('express-promise')());

router.get('/test-info/:testId', function(req, res) {
    res.json(db.get('test-info-' + req.params.testId));
});

module.exports = router;