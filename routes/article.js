var express = require('express');
var router = express.Router();

var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');

var mongoUrl = 'mongodb://localhost:27017'

const resolveId = function(req, res, next){
  const notFound = function(){
    const errNotFound = new Error('Not Found');
    errNotFound.status = 404;
    res.render('error', { message: "Id "+req.params.id+" is not valid!", error: errNotFound });
  }

  try{
    const id = objectId(req.params.id || req.body.id)
  } catch (error){
    notFound()
  }

  return id
}

/* GET home page. */
router.get('/', function(req, res, next) {
  mongo.connect(mongoUrl, function(err, client) {
    assert.equal(null, err);
    const db = client.db('article-db')
    db.collection('article').find().toArray( function(err, result){
      assert.equal(null, err);
      db.close()
      res.render('index', { articles: result });
    });
  })
});

router.get('/article/new', function(req, res, next) {
  res.render('article', { article: {} });
});

router.get('/article/:id/edit', function(req, res, next) {
  const id = resolveId(req, res, next)

  mongo.connect(mongoUrl, function(err, client) {
    assert.equal(null, err);
    const db = client.db('article-db')
    db.collection('article').find(id).toArray( function(err, result){
      assert.equal(null, err);
      db.close()
      if(result.length){
        res.render('article', { article: result[0] });
      } else {
        const errNotFound = new Error('Not Found');
        errNotFound.status = 404;
        res.render('error', { message: "Article "+req.params.id+" not found!", error: errNotFound });
      }
    });
  })
});

router.get('/article/:id', function(req, res, next) {
  const id = resolveId(req, res, next)

  mongo.connect(mongoUrl, function(err, client) {
    assert.equal(null, err);
    const db = client.db('article-db')
    db.collection('article').find(id).toArray( function(err, result){
      assert.equal(null, err);
      db.close()
      if(result.length){
        res.render('article_presentation', { article: result[0] });
      } else {
        const errNotFound = new Error('Not Found');
        errNotFound.status = 404;
        res.render('error', { message: "Article with id "+id+" not found", error: errNotFound });
      }
    });
  })
});

router.post('/article/save', function(req, res, next) {
  var article = {
    title: req.body.title,
    text: req.body.text,
  }

  mongo.connect(mongoUrl, function(err, client) {
    assert.equal(null, err);
    const db = client.db('article-db')
    db.collection('article').insertOne(article, function(err, result){
      assert.equal(null, err);
      db.close()
      res.redirect(result.insertedId)
    });
  })
});

router.post('/article/update', function(req, res, next) {
  const id = resolveId(req, res, next)

  var article = {
    title: req.body.title,
    text: req.body.text,
  }

  console.log("++++++++++++++++++++++++++")
  console.log(article)
  console.log(id)
  console.log("++++++++++++++++++++++++++")

  mongo.connect(mongoUrl, function(err, client) {
    assert.equal(null, err);
    const db = client.db('article-db')
    db.collection('article').updateOne({ _id: id },{ $set: article }, function(err, result){
      assert.equal(null, err);
      db.close()
      res.redirect(req.body.id)
    });
  })

});

router.get('/article/:id/delete', function(req, res, next) {
  const id = resolveId(req, res, next)
  res.render('delete', { id: id });
});

router.post('/article/delete', function(req, res, next) {
  const id = resolveId(req, res, next)

  mongo.connect(mongoUrl, function(err, client) {
    assert.equal(null, err);
    const db = client.db('article-db')
    db.collection('article').deleteOne({ _id: id }, function(err, result){
      assert.equal(null, err);
      db.close()
      res.redirect('/')
    });
  })
});

module.exports = router;
