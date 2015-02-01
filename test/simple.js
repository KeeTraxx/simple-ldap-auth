var chai = require('chai');
var fs = require('fs');
var path = require('path');
var should = chai.should();
var SimpleLdapAuth = require('..');

var conf = require(path.join(__dirname, '..', '.local', 'configuration.json'));
var auth = require(path.join(__dirname, '..', '.local', 'auth.json'));

describe('Basic Test', function () {
    it('Authentication with valid credentials', function (done) {
        var sla = new SimpleLdapAuth(conf);
        sla.auth(auth.username, auth.password, function (err, res) {
            should.not.exist(err);
            res.should.exist();
            res.should.be.an('object');
            res.dn.should.be.a('string');
            res.cn.should.be.a('string');
            res.displayName.should.be.a('string');
            res.memberOf.should.be.an('array');
            done();
        });
    });

    it('Authentication with invalid credentials', function (done) {
        var sla = new SimpleLdapAuth(conf);
        sla.auth('foo', 'bar', function (err, res) {
            err.should.exist();
            should.not.exist(res);
            err.dn.should.be.empty();
            err.code.should.equal(49);
            err.name.should.contain('InvalidCredentialsError');
            done();
        });
    });

    it('Authentication with empty user', function (done) {
        var sla = new SimpleLdapAuth(conf);
        sla.auth('', 'bar', function (err, res) {
            err.should.exist();
            should.not.exist(res);
            err.dn.should.be.empty();
            err.code.should.equal(49);
            err.name.should.contain('InvalidCredentialsError');
            done();
        });
    });

    it('Authentication with empty password', function (done) {
        var sla = new SimpleLdapAuth(conf);
        sla.auth('foo', '', function (err, res) {
            err.should.exist();
            should.not.exist(res);
            err.should.contain('No password provided')
            done();
        });
    });
});