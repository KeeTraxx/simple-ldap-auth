/**
 * Created by ktran on 19.11.2014.
 */
var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');


var app = express();
app.use(logger('dev'));
app.use(session({secret: 'PEBCAK'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
var SimpleLdapAuth = require('../');

var auth = SimpleLdapAuth({
    server: {
        url: 'ldap://ldap.campus.unibe.ch:389',
        domain: 'CAMPUS',
        adminDn: 'CN=IWI-inventory,OU=Services,OU=IWI,OU=OU Hosting,DC=campus,DC=unibe,DC=ch',
        adminPassword: 'bwDG6m7xaeOY6Xw-sLS_',
        searchBase: 'OU=Employees,OU=PARIS,DC=campus,DC=unibe,DC=ch',
        searchFilter: '(&(objectcategory=person)(objectclass=user)(|(samaccountname={{username}})(mail={{username}})))',
        searchAttributes: ['displayName', 'mail', 'sAMAccountName', 'uid'],
        groupSearchBase: 'OU=OU Hosting,DC=campus,DC=unibe,DC=ch'
    }
});

app.use('/', auth);

app.get('/', function (req, res) {
    console.log(req.host, req.hostname, req.port)
    req.ldap.search('DC=campus,DC=unibe,DC=ch', {
        scope: 'sub',
        filter: '(&(objectclass=group)(|(cn=IWI-hilfsassistenten-im)(cn=IWI-hilfsassistenten-ie)(cn=IWI-assistenten)))'
    }, function(err, result){
        console.log(result);
    });
    res.send(req.session.user);
});


app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});