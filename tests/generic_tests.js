 var    request = require('supertest'),
        app = require('./../app.js'),
        bunyan = require('bunyan'),
        chai = require('chai'),
        _      = require('lodash'),
        config = require("./../config").config.dev;

chai.should();
//var expect = chai.expect; // Uncomment as needed
//var assert = chai.assert; // Uncomment as needed
var testIDString = String(new Date().toISOString()).replace(/\:/gi, "-");
var log = bunyan.createLogger({ name: "Mocha runner", streams: [{ level:  "fatal", stream: process.stdout }]});
var Cookie = "";

describe('Landing page', function(){
    it('respond with 200.', function(done){
    request(app)
        .get('/')
        .expect(200)
        .end(function(err, res){
            // Save the cookie for use in other tests
            Cookie = res.headers['set-cookie'].map(function(r){
                return r.replace("; path=/; httponly","");
            }).join("; ");
            done();
        });
    });
});

// Really just an example test showing how to store and reuse a session (great for login/signup)
describe('A test that requires the session cookie', function(){
    it('respond with 200 using a cookie.', function(done){
        var req = request(app).get('/');
        req.cookies = Cookie;
        req.expect(200)
        .end(function(err, res){
            // Maybe your response is a JSON response with a `user` object from the database:
            //res.body.user.should.not.have.property('password');
            //res.body.user.should.have.property('username');
            var findCookie = String(res.request.cookies).split(config.appName + ".sid");
            findCookie.length.should.equal(2);
            done();
        });
    });
});
