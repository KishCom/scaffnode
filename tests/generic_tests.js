var request = require('supertest'),
    app = require('./../app.js'),
    bunyan = require('bunyan'),
    chai = require('chai'),
    config = require("./../config").config.dev;

chai.should();

//var expect = chai.expect; // Uncomment as needed
//var assert = chai.assert; // Uncomment as needed

//var testIDString = String(new Date().toISOString()).replace(/\:/gi, "-");
var log = bunyan.createLogger({name: "Mocha runner", streams: [{level:  "fatal", stream: process.stdout}]});
var Cookie = "";

describe('Landing page', function(){
    it('respond with 200.', function(done){
        request(app)
        .get('/')
        .expect(200)
        .end(function(err, res){
            if (err){ log.error(err); return done(err); }
            // Save the cookie for use in other tests
            Cookie = res.headers['set-cookie'].map((r) => r.replace("; path=/; httponly", "")).join("; ");
            done();
        });
    });
    it('respond with 200 in french when "Accept-Language" is set to "fr" priority.', function(done){
        request(app)
        .get('/')
        .set({"Accept-Language": "fr-CA,fr;q=0.8,en-CA,en;q=0.7,da;q=0.6"})
        .end(function(err, res){
            if (err){ console.error(err); }
            res.status.should.equal(200);
            res.text.should.contain('lang="fr-CA"');
            done();
        });
    });
    it('respond in french with a 200 when the "Accept-Language" is set to "en" priority, but "lang" query param is being set to "fr.', function(done){
        request(app)
        .get('/?lang=fr')
        .set({"Accept-Language": "en-CA,en;q=0.8,da;q=0.6"})
        .end(function(err, res){
            if (err){ console.error(err); }
            res.status.should.equal(200);
            res.text.should.contain('lang="fr-CA"');
            Cookie = res.headers['set-cookie'].map((r) => r.replace("; path=/; httponly", "")).join("; ");
            done();
        });
    });
    it('respond in french with a 200 when the "Accept-Language" is set to "en" priority, but the "lang" query param was set in an earlier request.', function(done){
        var req = request(app)
        .get('/');
        req.cookies = Cookie;
        req.set({"Accept-Language": "en-CA,en;q=0.8,da;q=0.6"})
        .end(function(err, res){
            if (err){ console.error(err); }
            res.status.should.equal(200);
            res.text.should.contain('lang="fr-CA"');
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
            if (err){ log.error(err); return done(err); }
            // Maybe your response is a JSON response with a `user` object from the database:
            //res.body.user.should.not.have.property('password');
            //res.body.user.should.have.property('username');
            var findCookie = String(res.request.cookies).split(config.appName + ".sid");
            findCookie.length.should.equal(2);
            done();
        });
    });
});
