var express = require('express');
var merge = require('merge');
var moment = require('moment');
var db = require('../db.js');

var router = express.Router();

router.use(require('express-promise')());

router.get('/test-info/:testId', function(req, res) {
    res.json(db.get('test-info-' + req.params.testId));
});

router.post('/start-test', function(req, res) {
    // Load test content
    var test = db.get('test-content-' + req.body.testId);
    // Create new test session
    var testSession = test.then(function(test) {
        // Merge the test into the test session
        var testSession = {
            type: 'test-session',
            reqInfo: req.body,
            testId: req.body.testId,
            testContent: test,
            startTime: moment().format() // The reqInfo also has a time, but we record both because I don't trust the client necessarily
        };
        return db.insert(testSession).then(function(insertResult) {
            testSession._id = insertResult.id;
            return testSession;
        });
    });

    res.json(testSession);

});

module.exports = router;