 var request = require('supertest'),
     chai = require('chai'),
     bunyan = require('bunyan'),
     mongoose = require('mongoose'),
     app = require('./../app.js'),
     Models = require("./../models"), models,
     config = require("./../config").config.test;
chai.should();
chai.use(require('chai-things'));
var randomSeed = String(new Date().toISOString()).replace(/\:/gi, "-");
var log = bunyan.createLogger({ name: "Mocha runner", streams: [{ level:  "fatal", stream: process.stdout }]});

// For the forgot password tests we need to reach into the DB and get the resetToken since we can't check email
//var testRunnerMongo = mongoose.createConnection(config.mongoDBURI);
models = new Models(null, log, config);
var UserModel = mongoose.model('Users', models.Users);
var knownResetToken = "";

// Test sign ups
describe('Signup', function(){
    function TestSignupValidationErrors(expectErrorOnThisField){
        return function(res) {
            if (!res.body.message){
                //console.log(res.body);
                return "Missing message text in JSON response.";
            }
            if (res.body.message !== "Validation failed"){
                //console.log(res.body);
                return "Missing 'Validation failed' from message response.";
            }
            if (!res.body.errors){
                //console.log(res.body);
                return "Missing validation errors array in JSON response.";
            }
            if (!res.body.errors[expectErrorOnThisField]){
                //console.log(res.body);
                return "Missing " + expectErrorOnThisField + " error in validation errors array in JSON response.";
            }
        };
    }
    it('with no data, return 400 with JSON.', function(done){
        request(app)
        .post('/users/signup')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400, done);
    });
    it('with bad email, return 400 with JSON.', function(done){
        request(app)
        .post('/users/signup')
        .send({ "email": ("douglas"+randomSeed+" bad email"),
                "name": ("Mocha Test" + randomSeed),
                "password": "somekindofpassword"
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(TestSignupValidationErrors('email'))
        .expect(400, done);
    });
    it('with missing email, return 400 with JSON.', function(done){
        request(app)
        .post('/users/signup')
        .send({ "name": ("Mocha Test" + randomSeed),
                "password": "somekindofpassword",
                "email": ""
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(TestSignupValidationErrors('email'))
        .expect(400, done);
    });
    it('with too short of password, return 400 with JSON.', function(done){
        request(app)
        .post('/users/signup')
        .send({ "email": ("douglas"+randomSeed+"@mailinator.com"),
                "name": ("Mocha Test" + randomSeed),
                "password": "2small"
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(TestSignupValidationErrors('password'))
        .expect(400, done);
    });
    it('with too long of password, return 400 with JSON.', function(done){
        request(app)
        .post('/users/signup')
        .send({ "email": ("douglas"+randomSeed+"@mailinator.com"),
                "name": ("Mocha Test" + randomSeed),
                "password": "suchareallylonglonglonglongpaaaaaaaaaaaaaaaaaaaaaaaaaasssssssssssssssssssssssssssssswwwwoooooooooooooooooorrrrrrrrrrrrrrrrrrrrrrrrrrrrd"
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(TestSignupValidationErrors('password'))
        .expect(400, done);
    });
    it('with missing password, return 400 with JSON.', function(done){
        request(app)
        .post('/users/signup')
        .send({ "email": ("douglas"+randomSeed+"@mailinator.com"),
                "name": ("Mocha Test" + randomSeed),
                "password": ""
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(TestSignupValidationErrors('password'))
        .expect(400, done);
    });
    // Finally do a successful signup with our superagent
    it('returns 201 with JSON.', function(done){
        request(app)
        .post('/users/signup')
        .send({ "email": ("douglas"+randomSeed+"@mailinator.com"),
                "name": ("Mocha Test" + randomSeed),
                "password": "areally!goodstrong444password"
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function(err, res){
            res.body.should.have.property("content");
            res.body.content.should.have.property("lang");
            res.body.content.lang.should.equal("en");
            done();
        });
    });

    // Sign up again and make sure it fails with a dupe message
    it('with dupe email, return 400 with JSON.', function(done){
        request(app)
        .post('/users/signup')
        .send({ "email": ("douglas"+randomSeed+"@mailinator.com"),
                "name": ("Mocha Test" + randomSeed),
                "password": "areally!goodstrong444password"
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(TestSignupValidationErrors('email'))
        .expect(400, done);
    });
});

// Login and logout
describe('Login and Logout', function(){
    it('redirect on logout.', function(done){
        request(app)
        .get('/logout')
        .expect('location', '/')
        .expect(302, done);
    });
    it('redirect on logout (/users/logout alias).', function(done){
        request(app)
        .get('/users/logout')
        .expect('location', '/')
        .expect(302, done);
    });

    // Test bad logins
    it('with missing email, return 401 with JSON.', function(done){
        request(app)
        .post('/users/login')
        .send({ "email": "",
                "password": "areally!goodstrong444password"
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
    it('with missing password, return 401 with JSON.', function(done){
        request(app)
        .post('/users/login')
        .send({ "email": ("douglas"+randomSeed+"@mailinator.com"),
                "password": ""
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
    it('with bad email, return 401 with JSON.', function(done){
        request(app)
        .post('/users/login')
        .send({ "email": ("douglas"+randomSeed),
                "password": "areally!goodstrong444password"
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
    it('with proper email, bad password, return 401 with JSON.', function(done){
        request(app)
        .post('/users/login')
        .send({ "email": ("douglas"+randomSeed+"@mailinator.com"),
                "password": "wrongpassword"
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401, done);
    });
    // Test our good login
    it('with proper email, and new password, return 200 with JSON.', function(done){
        request(app)
        .post('/users/login')
        .send({ "email": ("douglas"+randomSeed+"@mailinator.com"),
                "password": "areally!goodstrong444password"
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
});