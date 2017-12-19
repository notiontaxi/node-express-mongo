const express = require('express')

const mongoDbUrl = 'localhost:27017/article-db'
const router = express.Router()
const db = require('monk')(mongoDbUrl)
const articleTable = db.get('article')

const notFoundError = function(error){
  res.render('error', { message: "Article "+req.params.id+" not found!", error: error });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  articleTable.find({}).then(function(articles) {
    res.render('index', { articles: articles });
  }).catch(function(error){ notFoundError(error) })
});

router.get('/article/new', function(req, res, next) {
  res.render('article', { article: {} });
});

router.get('/article/:id/edit', function(req, res, next) {
  const id = db.id(req.params.id || req.body.id)

  articleTable.find({_id: id}).then(function(articles){
    res.render('article', { article: articles[0] });
  }).catch(function(error){ notFoundError(error) })
});

router.get('/article/:id', function(req, res, next) {
  const id = db.id(req.params.id || req.body.id)

  articleTable.find({_id: id}).then(function(articles){
    res.render('article_presentation', { article: articles[0] });
  }).catch(function(error){ notFoundError(error) })
});

router.post('/article/save', function(req, res, next) {
  var article = {
    title: req.body.title,
    text: req.body.text,
  }

  articleTable.insert(article).then(function(article){
    res.redirect(article._id)
  }).catch(function(error){ notFoundError(error) })
});

router.post('/article/update', function(req, res, next) {
  const id = db.id(req.params.id || req.body.id)

  var article = {
    title: req.body.title,
    text: req.body.text,
  }

  articleTable.update({_id: id}, article).then(function(article){
    res.redirect(id)
  }).catch(function(error){ notFoundError(error) })
});

router.get('/article/:id/delete', function(req, res, next) {
  const id = db.id(req.params.id || req.body.id)
  res.render('delete', { id: id });
});

router.post('/article/delete', function(req, res, next) {
  const id = db.id(req.params.id || req.body.id)

  articleTable.remove({_id: id}).then(function(article){
    res.redirect('/')
  }).catch(function(error){ notFoundError(error) })
});

module.exports = router;
