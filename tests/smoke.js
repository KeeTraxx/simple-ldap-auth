/**
 * Created by kt_000 on 03.05.2014.
 */
var SimpleLdapAuth = require(__dirname + '../lib/SimpleLdapAuth');

var options = {
    server: {
        url: 'ldap://ldap.campus.unibe.ch:389',
        domain: 'CAMPUS',
        adminDn: 'CN=IWI-inventory,OU=Services,OU=IWI,OU=OU Hosting,DC=campus,DC=unibe,DC=ch',
        adminPassword: 'bwDG6m7xaeOY6Xw-sLS_',
        searchBase: 'OU=Employees,OU=PARIS,DC=campus,DC=unibe,DC=ch',
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