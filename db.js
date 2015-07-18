var nano = require('nano')(process.env.CLOUDANT_URL);

module.exports = nano.use('preinterviewtest');
