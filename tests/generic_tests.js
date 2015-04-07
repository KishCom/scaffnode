 var request = require('supertest'),
     app = require('./../app.js');

describe('Landing page', function(){
    it('respond with 200.', function(done){
    request(app)
        .get('/')
        .expect(200, done);
    });
});