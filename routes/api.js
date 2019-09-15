/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

let expect = require('chai').expect;
let bodyParser = require('body-parser');
let MongoClient = require('mongodb');
let ObjectId = require('mongodb').ObjectID;

module.exports = function (app) {
  
  let databaseURL = process.env.DATABASE;
  
  app.route('/api/threads/:board')
    .post((req,res)=>{
    
    let newThread = { 
    _id : new ObjectId(),
    board : req.params.board,
    text : req.body.text,
    delete_password : req.body.delete_password,
    created_on : new Date(),
    bumped_on : new Date(),
    reported : false,
    replies : []
  }
    MongoClient.connect(databaseURL,{useUnifiedTopology: true,useNewUrlParser: true},(err,data)=>{
      let db = data.db('Threads');
      db.collection('threads').insertOne(newThread,(err,doc)=>{
        if (err) throw err;
        MongoClient.connect(databaseURL,{useUnifiedTopology: true,useNewUrlParser: true},(err,data)=>{
      let db = data.db('Threads');
      db.collection('threads').findOneAndUpdate({_id:newThread._id},{$set:{thread_id:newThread._id}},{returnNewDocument:true},(err,doc)=>{
        res.redirect('/b/'+req.params.board+'/');
      })
    })
  })
    })
  })
    .get((req,res)=>{
    MongoClient.connect(databaseURL,{useUnifiedTopology: true,useNewUrlParser: true},(err,data)=>{
      let db = data.db('Threads');
      db.collection('threads').find({board:req.params.board}).sort({bumped_on: -1}).toArray((err,doc)=>{
        if (err) throw err;
        res.json(doc);
      })
    });
    
  })
    .put((req,res)=>{reportFunction(req,res)})
    .delete((req,res)=>{
    let deleteMe = {
      board: req.body.board,
      thread_id: req.body.thread_id,
      delete_password: req.body.delete_password
    }
    MongoClient.connect(databaseURL,{useUnifiedTopology: true, useNewUrlParser: true},(err,data)=>{
      let db = data.db('Threads');
      db.collection('threads').findOne({_id:ObjectId(deleteMe.thread_id)},(err,doc)=>{
        if (err) throw err;
        if(deleteMe.board == doc.board && deleteMe.delete_password == doc.delete_password){
             MongoClient.connect(databaseURL,{useUnifiedTopology: true, useNewUrlParser: true},(err,data)=>{
      let db = data.db('Threads');
      db.collection('threads').deleteOne({_id:ObjectId(deleteMe.thread_id)},(err,doc)=>{
        res.send('Successfully deleted thread!');
        });
        });
        }
        else{
          res.send('incorrect password or board.')
        }
      })
    })
  })
    
  app.route('/api/replies/:board')
  .post((req,res)=>{
    let reply ={
      _id: new ObjectId(),
      board: req.body.board,
      thread_id:req.body.thread_id,
      text:req.body.text,
      delete_password:req.body.delete_password,
      reported: false,
      created_on: new Date()
    };
   MongoClient.connect(databaseURL,{useUnifiedTopology: true,useNewUrlParser: true},(err,data)=>{
     let db = data.db('Threads');
     db.collection('threads').findOneAndUpdate({_id:ObjectId(reply.thread_id)},{$push:{replies:reply},$set:{bumped_on:new Date()}},
                                               {upsert:true,returnNewDocument:true},(err,doc)=>{
       if (err) throw err;
      res.redirect(`/b/${req.body.board}/${reply.thread_id}`);
     })
   }) 
  })
  .get((req,res)=>{
    MongoClient.connect(databaseURL,{useUnifiedTopology: true,useNewUrlParser: true},(err,data)=>{
      let db = data.db('Threads');
      db.collection('threads').findOne({_id:ObjectId(req.query.thread_id)},(err,doc)=>{
        if (err) throw err;
        res.json(doc);
      })
    })
  })
  .put((req,res)=>{reportFunction(req,res)})
  .delete((req,res)=>{
    let deleteRep = {
      thread_id: req.body.thread_id,
      reply_id: req.body.reply_id,
      delete_password: req.body.delete_password
    };
 
    MongoClient.connect(databaseURL,{useUnifiedTopology: true, useNewUrlParser:true}, (err,data)=>{
      if (err) throw err;
      let db = data.db('Threads');
      db.collection('threads').find({"replies._id":ObjectId(deleteRep.reply_id)},{projection:{replies:{$elemMatch:{_id:ObjectId(deleteRep.reply_id)}}}}).toArray((err,doc)=>{
        if (err) throw err;
         if(deleteRep.delete_password == doc[0].replies[0].delete_password && deleteRep.reply_id == doc[0].replies[0]._id){
           console.log('SUCK IT TREBEK!');
       db.collection('threads').findOneAndUpdate({"replies":{"$elemMatch":{_id:ObjectId(deleteRep.reply_id)}}},{$set:{
         "replies.$.text":'[deleted]'}},{returnNewDocument:true},(err,doc)=>{
         if (err) throw err;
         res.send('Reply deleted!');
       })
         }
        else{
          res.send('Incorrect Password');
        }
        //}
      }) 
    })
  })
  
const reportFunction = (req,res)=>{
   let report = {
        report_id: req.body.report_id,
        reply_id: req.body.reply_id,
        thread_id: req.body.thread_id
      };
    MongoClient.connect(databaseURL,{useUnifiedTopology: true,useNewUrlParser: true},(err,data)=>{
      let db = data.db('Threads');
      console.log(report.reply_id);
      if(report.reply_id == undefined && report.report_id != undefined){
      db.collection('threads').findOneAndUpdate({_id:ObjectId(report.thread_id)},{$set:{reported:true}},{returnNewDocument:true},(err,doc)=>{
        if (err) throw err;
        if(doc!=null){
        res.send('Report Successful.');
        }
        else{
          res.send('Failed to report.');
        }
      })
      }
      
      else if(report.reply_id != undefined && report.report_id == undefined){
       db.collection('threads').findOneAndUpdate({"replies":{"$elemMatch":{_id:ObjectId(report.reply_id)}}},{$set:{
         "replies.$.reported":true}},{returnNewDocument:true},(err,doc)=>{
         if (err) throw err;
         if(doc != null){
        res.send('Successfully Reported');
         }
         else{
           res.send('Error Reporting');
         }
     })
    }
      
      else{
        res.send('Error Reporting');
      }
    })
};
};
