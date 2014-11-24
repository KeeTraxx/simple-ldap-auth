/*
In app.js add the following lines:
 var authentication = require('./example_middleware/authentication');
 app.use('/', authentication );
*/

var express = require('express');
var _ = require('underscore');

var SimpleLdapAuth = require(__dirname + '/../lib/SimpleLdapAuth');

var defaults = {
    server: {
        /*url: 'ldap://activedirectory.contoso.com:389',
         domain: 'CONTOSO',
         adminDn: 'CN=Administrator,DC=corp,DC=contoso,DC=com',
         adminPassword: 'somepassword',

         searchBase: 'OU=Users,DC=corp,DC=contoso,DC=com',
         */
         searchFilter: '(&(objectcategory=person)(objectclass=user)(|(samaccountname={{username}})(mail={{username}})))',
         searchAttributes: ['displayName', 'mail', 'sAMAccountName', 'uid']
    }
};



function getRouter(options) {
    var router = express.Router();
    var configuration = _.extend(defaults, options);

    router.get('/login', function(req, res) {
        res.sendfile('login-template.html', {root: __dirname });
    });

    router.get('/logout', function(req, res){
        req.session.destroy();
        res.redirect('/');
    });

    router.post('/login', function(req,res){
        if ( req.body.username && req.body.password ) {
            auth.authenticate(req.body.username, req.body.password,function(err, user){
                if (err) {
                    console.warn(err.dn, err.code, err.name, err.message);
                    res.render(__dirname + '/login', { title: 'Login', message: 'Wrong password or username!' });
                } else {
                    req.session.user = user;
                    res.redirect(req.session.redirectUrl + (req.body.redirectHash || '' ) || '/');
                }
            });
        } else {
            res.sendfile('login-template.html', {root: __dirname });
        }
    });

    var auth = new SimpleLdapAuth(configuration,function(err, auth){
        if ( err ) {
            console.warn(err.code,err.name,err.message);
        }
    });


    router.all('*', function(req, res, next) {
        req.ldap = auth;
        if(req.session.user) {
            // user is logged in
            next();
        } else {
            req.session.redirectUrl = req.url;
            res.redirect('/login');
        }
    });

    return router;
}

module.exports = getRouter;