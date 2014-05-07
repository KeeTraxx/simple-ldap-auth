simple-ldap-auth
================

Very lightweight LDAP / Active Directory authentication.

Usage
-----

### For Express 4.x
Copy `example_middleware/authentication.js` to your project to `/helpers/authentication.js`.

Add the following lines to your app.js:
```javascript
var authentication = require('./helpers/authentication');
app.use('/', authentication );
```

Modify server credentials in `/helpers/authentication.js`