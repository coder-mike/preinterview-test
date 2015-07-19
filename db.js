var nano = require('nano')(process.env.CLOUDANT_URL);

var db = nano.use('preinterviewtest');

var originalGet = db.get;
db.get = function(name) {
    return new Promise(function(resolve, reject) {
        console.log("Fetching", name);
        originalGet(name, function (err, doc) {
            if (err) {
                reject(err);
                console.log(err)
            } else {
                resolve(doc);
            }
        });
    });
}

var originalInsert = db.insert;
db.insert = function(doc) {
    return new Promise(function(resolve, reject) {
        console.log("Inserting", doc);
        originalInsert(doc, function (err, result) {
            if (err) {
                reject(err);
                console.log(err)
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = db;
