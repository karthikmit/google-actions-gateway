const couchbase = require('couchbase');
const constants = require('../../config');

class UserHandler {

    constructor() {
        const cluster = new couchbase.Cluster('couchbase://' + constants.CB_SERVICE +  '/');
        cluster.authenticate('Administrator', 'password');
        this.bucket = cluster.openBucket('gag-user-profiles');
        this.N1qlQuery = couchbase.N1qlQuery;

        let couchbaseConnected = false;
        this.bucket.on('error', function (err) {
            couchbaseConnected = false;
            console.log('CB CONNECTION ERROR:', err);
        });

        this.bucket.on('connect', function () {
            couchbaseConnected = true;
            console.log('connected to CouchBase');
        });

        this.bucket.manager().createPrimaryIndex(function(err) {
            console.log("Primary index created :: " + !err ? " Success " : err);
        });
    }

    getUserInfo(userId, cb) {
        this.bucket.get('id:' + userId, cb);
    }

    setUserInfo(userId, userInfo, cb) {
        this.bucket.upsert('id:' + userId, userInfo, {}, cb);
    }
}

module.exports = {
  userHandler : new UserHandler()
};