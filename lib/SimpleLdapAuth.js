var assert = require('assert');
var ldap = require('ldapjs');
var _ = require('underscore');

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

function SimpleLdapAuth(opts, callback) {
    var auth = this;
    this.opts = _.extend({}, defaultOptions, opts || {});

    assert(this.opts.server.url);

    this.adminClient = ldap.createClient({
        url: this.opts.server.url,
        timeout: 10000,
        connectTimeout: 10000
    });

    this.adminClient.bind(this.opts.server.adminDn, this.opts.server.adminPassword, function(err){
        if ( err ) {
            callback(err, null)
        } else {
            callback(null, auth);
        }
    });
}

SimpleLdapAuth.prototype.authenticate = function(user,secret,callback) {
    var auth = this;
    var userClient = ldap.createClient({
        url: this.opts.server.url,
        timeout: 10000,
        connectTimeout: 10000
    });

    userClient.bind(auth.opts.server.domain + '\\' + user, secret, function(err) {
        if (err) {
            callback(err);
        } else {
            var search = auth.opts.server.searchFilter.replace(/\{\{username\}\}/g,user);
            console.log();
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
                        console.log('entry: ' + JSON.stringify(entry.object));
                        entries.push(entry.object);
                    });
                    res.on('error', function(err) {
                        console.error('error: ' + err.message);
                        callback(err);
                    });
                    res.on('end', function(result) {
                        console.log('status: ' + result.status);
                        callback(null, entries[0]);
                    });
                }
            });
        }
    });
};

module.exports = SimpleLdapAuth;