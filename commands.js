var express = require('express');
var Client = require('./client');

var router = express.Router();

var client = new Client({
  bookId: '568896651bfd500300fa9a5f',
  key: process.env['FIELDBOOK_KEY'],
  secret: process.env['FIELDBOOK_SECRET'],
})

router.use(function (req, res, next) {
  var token = req.body && req.body.token;
  if (token === process.env['SLACK_COMMAND_TOKEN']) {
    next();
  } else {
    res.status(403).send("Error: Request token doesn't match SLACK_COMMAND_TOKEN");
  }
})

router.post('/', function (req, res, next) {
  var body = req.body;
  console.log(`got command from ${body.user_name}: ${body.command} ${body.text}`);

  client.list('items').then(function (items) {
    var lines = items.map(row => `${row.id} ${row.name}`);
    res.send(lines.join('\n'));
  }).fail(function (error) {
    console.error('error handling command', error);
    next(error);
  })
})

module.exports = router;
