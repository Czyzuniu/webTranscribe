var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('/intro.html');
});


/* GET home page. */
router.get('/speechTest', function(req, res, next) {
  res.render('index');
});

module.exports = router;
