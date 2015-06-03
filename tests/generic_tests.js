 var    request = require('supertest'),
        app = require('./../app.js'),
        bunyan = require('bunyan'),
        chai = require('chai'),
        _      = require('lodash'),
        config = require("./../config").config.test;

chai.should();
//var expect = chai.expect; // Uncomment as needed
//var assert = chai.assert; // Uncomment as needed
var testIDString = String(new Date().toISOString()).replace(/\:/gi, "-");
var log = bunyan.createLogger({ name: "Mocha test runner", streams: [{ level:  "fatal", stream: process.stdout }]});
var Cookie = "";
var knownModelID = null;
var knownTotalModels = 0;

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

// Really just an example test showing how to store and reuse a session (great for authenticated requests which this app and tests don't cover)
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

// Test out our CRUD
describe('CRUD: Create tests', function(){
    it('Fail to create with missing name respond with 400.', function(done){
    request(app)
        .post('/model')
        .send({ "content": "Some kinda test content."})
        .end(function(err, res){
            res.status.should.equal(400);
            res.body.should.have.property("error");
            res.body.error.should.equal(true);
            res.body.should.have.property("message");
            done();
        });
    });
    it('Fail to create with missing content respond with 400.', function(done){
    request(app)
        .post('/model')
        .send({ "name": "Testy Testerson" })
        .end(function(err, res){
            res.status.should.equal(400);
            res.body.should.have.property("error");
            res.body.error.should.equal(true);
            res.body.should.have.property("message");
            done();
        });
    });
    it('Create successfully respond with 201.', function(done){
    request(app)
        .post('/model')
        .send({ "name": "Testy Testerson" + testIDString,
                "content": "Some kinda test content." + testIDString})
        .expect(201, done);
    });
});

 describe('CRUD: Read tests', function(){
    it('Read successfully respond with 200 and more than 0 example model objects.', function(done){
    request(app)
        .get('/model')
        .end(function(err, res){
            res.status.should.equal(200);
            res.body.should.have.property("content");
            knownModelID = res.body.content[0].id;
            knownTotalModels = res.body.content.length;
            // We use this same logic after we delete (looking for -1) so we test here too:
            (_.findIndex(res.body.content, "id", knownModelID)).should.be.greaterThan(-1);
            done();
        });
    });
});

describe('CRUD: Update tests', function(){
    it('Update fails with 400 when missing "name" from request object.', function(done){
    request(app)
        .post('/model/update')
        .send({
            "content": "Updated content." + testIDString,
            "scaffnodeId": knownModelID
        })
        .end(function(err, res){
            res.status.should.equal(400);
            res.body.should.have.property("error");
            res.body.error.should.equal(true);
            done();
        });
    });
    it('Update fails with 400 when missing "content" from request object.', function(done){
    request(app)
        .post('/model/update')
        .send({
            "name": "Rusty Rusterson" + testIDString,
            "scaffnodeId": knownModelID
        })
        .end(function(err, res){
            res.status.should.equal(400);
            res.body.should.have.property("error");
            res.body.error.should.equal(true);
            done();
        });
    });
    it('Update fails with 400 when missing "id" from request object.', function(done){
    request(app)
        .post('/model/update')
        .send({
            "name": "Rusty Rusterson" + testIDString,
            "content": "Updated content." + testIDString
        })
        .end(function(err, res){
            res.status.should.equal(400);
            res.body.should.have.property("error");
            res.body.error.should.equal(true);
            done();
        });
    });
    it('Update fails with 400 with invalid "id" from request object.', function(done){
    request(app)
        .post('/model/update')
        .send({
            "name": "Rusty Rusterson" + testIDString,
            "content": "Updated content." + testIDString,
            "scaffnodeId": "lolwut"
        })
        .end(function(err, res){
            res.status.should.equal(400);
            res.body.should.have.property("error");
            res.body.error.should.equal(true);
            done();
        });
    });

    it('Update successfully respond with 200 and more the updated example model object.', function(done){
    request(app)
        .post('/model/update')
        .send({
            "name": "Rusty Rusterson" + testIDString,
            "content": "Updated content." + testIDString,
            "scaffnodeId": knownModelID
        })
        .end(function(err, res){
            res.status.should.equal(200);
            res.body.should.have.property("content");
            res.body.content.should.have.property("name");
            res.body.content.name.should.equal("Rusty Rusterson" + testIDString);
            res.body.should.have.property("message");
            res.body.message.should.equal("Content updated.");
            done();
        });
    });
});

 describe('CRUD: Delete tests', function(){
    it('Delete successfully respond with 200.', function(done){
    request(app)
        .post('/model/remove')
        .send({
            "scaffnodeId": knownModelID
        })
        .end(function(err, res){
            res.status.should.equal(200);
            res.body.should.have.property("message");
            res.body.message.should.equal("Content removed.");
            res.body.should.have.property("id");
            var knownDeletedId = res.body.id;
            done();
        });
    });

    it('Ensure proper content was deleted successfully.', function(done){
    request(app)
        .get('/model')
        .end(function(err, res){
            res.status.should.equal(200);
            res.body.should.have.property("message");
            res.body.should.have.property("content");
            ((knownTotalModels - 1) === res.body.content.length).should.equal(true);
            (_.findIndex(res.body.content, "id", knownModelID)).should.equal(-1);
            done();
        });
    });
});
