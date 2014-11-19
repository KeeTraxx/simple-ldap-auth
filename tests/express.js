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
app.use(session({ secret: 'PEBCAK'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
var SimpleLdapAuth = require('../');

app.use('/', SimpleLdapAuth({
    server: {
        url: '***REMOVED***',
        domain: '***REMOVED***',
        adminDn: '***REMOVED***',
        adminPassword: '***REMOVED***',
        searchBase: '***REMOVED***',
        searchFilter: '(&(objectcategory=person)(objectclass=user)(|(samaccountname={{username}})(mail={{username}})))',
        searchAttributes: ['displayName', 'mail', 'sAMAccountName', 'uid']
    }
}));

app.get('/', function(req,res){
    res.send('ok');
});


app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});