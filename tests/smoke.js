/**
 * Created by kt_000 on 03.05.2014.
 */
var SimpleLdapAuth = require(__dirname + '../lib/SimpleLdapAuth');

var options = {
    server: {
        url: '***REMOVED***',
        domain: '***REMOVED***',
        adminDn: '***REMOVED***',
        adminPassword: '***REMOVED***',
        searchBase: '***REMOVED***',
        searchFilter: '(&(objectcategory=person)(objectclass=user)(|(samaccountname={{username}})(mail={{username}})))',
        searchAttributes: ['displayName', 'mail', 'sAMAccountName', 'uid']
    }
};

var auth = new SimpleLdapAuth(options);
console.log(auth);
auth.authenticate('ktran', 'SXfvGB2w', function (err, res) {
    if (err) {
        console.warn(err.message);
    } else {
        console.log(res);
    }

});

auth.authenticate('kttest', 'SXfvGB2w', function (err, res) {
    if (err) {
        console.warn(err.message);
    } else {
        console.log(res);
    }

});