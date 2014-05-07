/*
In app.js add the following lines:
 var authentication = require('./example_middleware/authentication');
 app.use('/', authentication );
*/

var express = require('express');
var router = express.Router();

var SimpleLdapAuth = require('simple-ldap-auth');

var options = {
    server: {
        /*url: 'ldap://activedirectory.contoso.com:389',
         domain: 'CONTOSO',
         adminDn: 'CN=Administrator,DC=corp,DC=contoso,DC=com',
         adminPassword: 'somepassword',
         searchBase: 'OU=Users,DC=corp,DC=contoso,DC=com',
         searchFilter: '(&(objectcategory=person)(objectclass=user)(|(samaccountname={{username}})(mail={{username}})))',
         searchAttributes: ['displayName', 'mail', 'sAMAccountName', 'uid']*/
    }
};

router.get('/login', function(req, res) {
    res.render('login', { title: 'Login' });
});

router.post('/login', function(req,res){
    if ( req.body.username && req.body.password ) {
        auth.authenticate(req.body.username, req.body.password,function(err, user){
            if (err) {
                console.warn(err.dn, err.code, err.name, err.message);
                res.render(__dirname + '/login', { title: 'Login', message: 'Wrong password or username!' });
            } else {
                req.session.user = user;
                res.redirect(req.session.redirectUrl || '/');
            }
        });
    } else {
        res.render('login', { title: 'Login', message: 'Wrong password or username!' });
    }
});

router.get('/', function(req, res, next) {
    if(req.session.user) {
        // user is logged in
        next();
    } else {
        req.session.redirectUrl = req.url;
        res.redirect('/login');
    }
});


var auth = new SimpleLdapAuth(options,function(err, auth){
    if ( err ) {
        console.warn(err.code,err.name,err.message);
    }
});

module.exports = router;