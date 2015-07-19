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
    var testContent = db.get('test-content-' + req.body.testId);
    var testInfo = db.get('test-info-' + req.body.testId);
    // Create new test session
    var testSession = Promise.all([testContent, testInfo]).then(function(test) {
        var testContent = test[0];
        var testInfo = test[1];
        // Merge the test into the test session
        var testSession = {
            type: 'test-session',
            testInfo: testInfo,
            reqInfo: req.body,
            testId: req.body.testId,
            testContent: testContent,
            startTime: moment().format() // The reqInfo also has a time, but we record both because I don't trust the client necessarily
        };
        return db.insert(testSession).then(function(insertResult) {
            testSession._id = insertResult.id;
            testSession._rev = insertResult.rev;
            return testSession;
        });
    });

    res.json(testSession);
});

router.get('/test-session/:testSessionId', function(req, res) {
    res.json(db.get(req.params.testSessionId).then(function(testSession) {
        if (testSession.type !== 'test-session') {
            throw new Error("Requested resource is of wrong type");
        }
        return testSession;
    }));
});

module.exports = router;