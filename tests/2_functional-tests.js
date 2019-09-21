/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST',function() {
     test('POST a new board', (done)=>{
      chai.request(server)
      .post('/api/threads/newBoard')
      .send({
       board:'newBoard',
       text:'Test text',
       delete_passwrd:'fakePassword'
     })
        .end(function(err, res){
          assert.equal(res.status,200);
          assert.equal(res.redirects[0].slice(22),'/b/newBoard');
         done();
    });
       })
    });
    
    suite('GET', function() {
      test('GET threads on board',(done)=>{
         chai.request(server)
      .get('/api/threads/newBoard')
        .end(function(err, res){
          assert.equal(res.status,200);
           assert.equal(res.body[0].board,'newBoard')
         done();
    });
        });
    });
    
    suite('DELETE', function() {
      test('DELETE a thread',(done)=>{
        chai.request(server)
        .delete('/api/threads/newBoard')
        .send({
          board:'newBoard',
          thread_id:'5d7d01c5e282f634b6139dc2',
          delete_password:null
        })
        .end((err,res)=>{
          if (err) done(err);
          assert.equal(res.status,200);
          assert.equal(res.text,'Successfully deleted thread!');
          done();
        })
      })
    }); 
    
    suite('PUT', function() {
      test('PUT Report response',(done)=>{
        chai.request(server)
        .put('/api/threads/newBoard')
        .send({
          board:'newBoard',
          thread_id:'5d7d01ca026d34352a766597',
          report_id:'5d7d01ca026d34352a766597'
        })
        .end((err,res)=>{
          if(err) done(err);
          assert.equal(res.status,200);
          assert.equal(res.text,'Report Successful.');
          done();
        })
      })
    });

  }); 
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('POST reply functionality', (done)=>{
      chai.request(server)
      .post('/api/replies/newBoard')
      .send({
        thread_id:'5d7d032aac066f37421fdc41',
        text:'Test Reply for Chai',
        delete_password:'Test'
      })
      .end((err,res)=>{
        if (err) throw err;
        assert.equal(res.status,200);
        assert.equal(res.redirects[0].slice(22),'/b/undefined/5d7d032aac066f37421fdc41')
        done();
      });
      });                                          
    });
    
    suite('GET', function() {
      test('GET reply request',(done)=>{
        chai.request(server)
        .get('/api/replies/general')
        .query({thread_id:'5d7d032aac066f37421fdc41'})
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.notEqual(res.body,null);
          done();
        })
      })
    });
    
    suite('PUT', function() {
      test('PUT reply response',(done)=>{
        chai.request(server)
        .put('/api/replies/general')
        .send({
          thread_id:'5d7d032aac066f37421fdc41',
          reply_id:'5d7ea73c4aa5240bc985f358'
        })
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.equal(res.text,'Successfully Reported');
          done();
        })
      })
    });
    
    suite('DELETE', function() {
      test('Delete reply functionality',(done)=>{
        chai.request(server)
        .delete('/api/replies/general')
        .send({
          thread_id:'5d7d032aac066f37421fdc41',
          reply_id:'5d7ea7c3582511101dcf19ba',
          delete_password:'Test'
        })
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.equal(res.text,'Reply deleted!');
          done();
        })
      })
    });
    
  });

});
