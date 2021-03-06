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
            startTime: getUtcTimeStr() // The reqInfo also has a time, but we record both because I don't trust the client necessarily
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
    var submissionTime = getUtcTimeStr();

    var testSession = req.body;

    // create new doc for submission
    var submissionDoc = merge(true, testSession);
    submissionDoc.type = 'test-submission';
    delete submissionDoc._rev;
    delete submissionDoc._id;
    submissionDoc.testSessionId = testSession._id;
    submissionDoc.submissionTime = submissionTime;
    // Insert the submission, and then update the test session
    var result = db.insert(submissionDoc).then(function() {

        // Fetch existing session information so that we have the right revision
        return db.get(testSession._id).then(function(orig) {
            // Use original revision (ignore conflicts)
            testSession._rev = orig._rev;

            testSession.submitted = true;
            if (!testSession.submittedTime) {
                testSession.submittedTime = [];
            }
            testSession.submittedTime.push(submissionTime); // Just in case they submit more than once

            return db.insert(testSession).then(function(insertResult) {
                // Update revision
                testSession._rev = insertResult.rev;
                return testSession;
            });
        });

    });
    res.json(result);
});

router.post('/save-test/', function(req, res) {
    var testSession = req.body;
    var result = db.get(testSession._id).then(function(orig) {
        testSession._rev = orig._rev; // ignore conflicts
        return db.insert(testSession).then(function(insertResult) {
            // Update revision
            testSession._rev = insertResult.rev;
            return testSession;
        });

    });
    res.json(result);
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

function getUtcTimeStr() {
    return moment.utc().format();
}

module.exports = router;