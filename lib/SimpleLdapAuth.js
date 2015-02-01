var ldap = require('ldapjs');
var _ = require('underscore');
var async = require('async');
var path = require('path');

var express = require('express');

var ejs = require('ejs');

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
    },
    loginUrl: '/login',
    defaultRedirect: '/',
    loginTemlate: path.join(__dirname, 'templates', 'login-template.ejs')
};

function SimpleLdapAuth(options) {
    var router = express.Router();
    var configuration = _.extend(defaults, options);

    router.get('/login', function (req, res) {
        ejs.renderFile(configuration.loginTemlate, {}, function (err, html) {
            res.send(html);
        });
    });

    router.get('/logout', function (req, res) {
        req.session.destroy();
        res.redirect('/');
    });

    router.post('/login', function (req, res) {
        if (req.body.username && req.body.password) {
            router.auth(req.body.username, req.body.password, function (err, user) {
                if (err) {
                    ejs.renderFile(configuration.loginTemlate, {msg: 'Wrong username or password!'}, function (err, html) {
                        res.send(html);
                    });
                } else {
                    req.session.user = user;
                    res.redirect(req.session.redirectUrl + (req.body.redirectHash || '' ) || '/');
                }
            });
        } else {
            ejs.renderFile(configuration.loginTemlate, {msg: 'Wrong username or password!'}, function (err, html) {
                res.send(html);
            });
        }
    });


    router.all('*', function (req, res, next) {
        if (req.session.user) {
            // user is logged in
            next();
        } else {
            req.session.redirectUrl = req.url;
            res.redirect('/login');
        }
    });

    router.auth = function(username, password, cb) {
        var adminClient = ldap.createClient({
            url: configuration.server.url,
            timeout: 10000,
            connectTimeout: 10000
        });

        adminClient.bind(configuration.server.adminDn, configuration.server.adminPassword, function (err) {
            if (err) {
                //callback(err, null)
                throw err;
            } else {
                //callback(null, auth);
            }
        });
        var userClient = ldap.createClient({
            url: configuration.server.url,
            timeout: 10000,
            connectTimeout: 10000
        });

        if (!password) {
            cb('No password provided');
            return;
        }

        userClient.bind(configuration.server.domain + '\\' + username, password, function (err) {
            if (err) {
                cb(err);
                return;
            }
            var search = configuration.server.searchFilter.replace(/\{\{username\}\}/g, username);
            adminClient.search(configuration.server.searchBase, {
                scope: 'sub',
                filter: search,
                attributes: configuration.server.searchAttributes
            }, function (err, res) {
                if (err) {
                    cb(err);
                } else {
                    var entries = [];
                    res.on('searchEntry', function (entry) {
                        entries.push(entry.object);
                    });
                    res.on('error', function (err) {
                        callback(err);
                    });
                    res.on('end', function (result) {
                        async.each(entries, function (entry, next) {
                            adminClient.search(configuration.server.groupSearchBase, {
                                scope: 'sub',
                                filter: '(&(objectclass=group)(member=' + entry.dn + '))'
                            }, function (err, res) {
                                res.on('searchEntry', function (group) {
                                    entry.memberOf = entry.memberOf || [];
                                    entry.memberOf.push(group.object);
                                });
                                res.on('end', function () {
                                    next();
                                });
                            });
                        }, function (err) {
                            cb(err, entries[0]);
                            adminClient.unbind();
                        });
                    });
                }
            });
        });

    };

    return router;

}

module.exports = SimpleLdapAuth;