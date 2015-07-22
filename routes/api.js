var express = require('express');
var merge = require('merge');
var moment = require('moment');
var db = require('../db.js');

var router = express.Router();

router.use(require('express-promise')());

router.get('/test-info/:testId', function(req, res) {
    var test = db.get(req.params.testId).then(verifyType('test'));
    res.json(test.then(function(test) {
        test.info.testId = test._id;
        return test.info;
    }));
});

function verifyType(type) {
    return function (document) {
        if (document.type !== type) {
            throw new Error("Document types do not match");
        }
        return document;
    }
}

router.post('/start-test', function(req, res) {
    // Load test content
    var test = db.get(req.body.testId).then(verifyType('test'));
    // Create new test session
    var testSession = test.then(function(test) {
        // Merge the test into the test session
        var testSession = {
            type: 'test-session',
            testInfo: test.info,
            reqInfo: req.body,
            testId: req.body.testId,
            questions: test.questions,
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

router.post('/submit-test', function(req, res) {
    var testSession = req.body;
    testSession.submitted = true;
    if (!testSession.submittedTime) {
        testSession.submittedTime = [];
    }
    testSession.submittedTime.push(moment().format()); // Just in case they submit more than once

    var updatedTestSession = db.insert(testSession).then(function(insertResult) {
        // Update revision
        testSession._rev = insertResult.rev;
        return testSession;
    });

    res.json(updatedTestSession);
});

router.get('/test/:testId', function(req, res) {
    res.json(db.get(req.params.testId).then(verifyType('test')));
});

router.post('/save-test', function(req, res) {
    var test = req.body;
    test.type = "test";
    res.json(db.insert(test).then(function (insertResult) {
        // update revision
        test._rev = insertResult.rev;
        return test;
    }));
});

module.exports = router;