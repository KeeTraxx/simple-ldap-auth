/**
 * Created by kt_000 on 03.05.2014.
 */
var SimpleLdapAuth = require('../');

new SimpleLdapAuth({},function(err, auth){
    if ( err ) {
        console.log(err);
    } else {
        auth.authenticate('user', 'password', function(err, res){
            if ( err ) {
                console.warn(err.message);
            } else {
                console.log(res);
            }
        });

    }
});