var assert = require('assert');
var ldap = require('ldapjs');
var _ = require('underscore');
var async = require('async');

var defaultOptions = {
    server: {
        /*url: 'ldap://activedirectory.contoso.com:389',
        domain: 'CONTOSO',
        adminDn: 'CN=Administrator,DC=corp,DC=contoso,DC=com',
        adminPassword: 'somepassword',
        searchBase: 'OU=Users,DC=corp,DC=contoso,DC=com',
        searchFilter: '(&(objectcategory=person)(objectclass=user)(|(samaccountname={{username}})(mail={{username}})))',
        searchAttributes: ['displayName', 'mail', 'sAMAccountName', 'uid']*/
    },
    loginUrl: '/login',
    defaultRedirect: '/'
};

function SimpleLdapAuth(opts) {
    var auth = this;
    this.opts = _.extend({}, defaultOptions, opts || {});

    assert(this.opts.server.url);
}

SimpleLdapAuth.prototype.authenticate = function(user,secret,callback) {
    var auth = this;

    this.adminClient = ldap.createClient({
        url: this.opts.server.url,
        timeout: 10000,
        connectTimeout: 10000
    });

    this.adminClient.bind(this.opts.server.adminDn, this.opts.server.adminPassword, function(err){
        if ( err ) {
            //callback(err, null)
            throw err;
        } else {
            //callback(null, auth);
        }
    });

    var userClient = ldap.createClient({
        url: this.opts.server.url,
        timeout: 10000,
        connectTimeout: 10000
    });

    userClient.bind(auth.opts.server.domain + '\\' + user, secret, function(err) {
        if (err) {
            callback(err);
            return;
        }
        var search = auth.opts.server.searchFilter.replace(/\{\{username\}\}/g,user);
        auth.adminClient.search(auth.opts.server.searchBase,{
            scope: 'sub',
            filter: search,
            attributes: auth.opts.server.searchAttributes
        }, function(err, res){
            if (err) {
                callback(err);
            } else {
                var entries = [];
                res.on('searchEntry', function(entry) {
                    entries.push(entry.object);
                });
                res.on('error', function(err) {
                    callback(err);
                });
                res.on('end', function(result) {
                    async.each(entries, function(entry,next){
                        auth.adminClient.search(auth.opts.server.groupSearchBase, {
                            scope: 'sub',
                            filter: '(&(objectclass=group)(member=' + entry.dn + '))'
                        }, function(err, res){
                            res.on('searchEntry', function(group) {
                                entry.memberOf = entry.memberOf || [];
                                entry.memberOf.push(group.object);
                            });
                            res.on('end', function(){
                                next();
                            });
                        });
                    }, function(err){
                        callback(err, entries[0]);
                        auth.adminClient.unbind();
                    });
                });
            }
        });
    });
};

SimpleLdapAuth.prototype.search = function(searchBase, query, callback) {
    this.adminClient = ldap.createClient({
        url: this.opts.server.url,
        timeout: 10000,
        connectTimeout: 10000
    });

    var client = this.adminClient;

    this.adminClient.bind(this.opts.server.adminDn, this.opts.server.adminPassword, function(err){
        if ( err ) {
            //callback(err, null)
            throw err;
        } else {
            client.search(searchBase, query, function(err, res){
                var entries = [];
                res.on('searchEntry', function(entry) {
                    entries.push(entry.object);
                });
                res.on('error', function(err) {
                    callback(err);
                });
                res.on('end', function(result) {
                    callback(null, entries);
                    client.unbind();
                });
            });
        }
    });
};

module.exports = SimpleLdapAuth;