module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-mocha-test');

    if (!grunt.file.exists('.local/configuration.json')) {
        grunt.file.write('.local/configuration.json', JSON.stringify({
            server: {
                url: 'ldap://ldap.contoso.com:389',
                domain: 'CONTOSO',
                adminDn: 'CN=Administrator,OU=Users,DC=contoso,DC=com',
                adminPassword: 'secret',
                searchBase: 'OU=Users,DC=contoso,DC=com',
                searchFilter: '(&(objectcategory=person)(objectclass=user)(|(samaccountname={{username}})(mail={{username}})))',
                //searchAttributes: ['displayName', 'mail', 'sAMAccountName', 'uid'],
                groupSearchBase: 'OU=Users,DC=contoso,DC=com'
            }
        }, null, 4));
    }

    if (!grunt.file.exists('.local/configuration.json')) {
        grunt.file.write('.local/configuration.json', JSON.stringify({
            username: 'testuser',
            password: 'testpass'
        }, null, 4));
    }

    grunt.registerTask('default', ['mochaTest']);

    grunt.initConfig({
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    // captureFile: 'results.txt', // Optionally capture the reporter output to a file
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
                },
                src: ['test/**/*.js']
            }
        }
    });
};