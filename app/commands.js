var express = require('express');
var Client = require('./client');

var router = express.Router();

router.client = new Client({
  bookId: '568896651bfd500300fa9a5f',
  key: process.env['FIELDBOOK_KEY'],
  secret: process.env['FIELDBOOK_SECRET'],
})

var sheet = 'items';
var fields = [
  {key: 'id', name: "ID"},
  {key: 'name', name: "Name"},
  {key: 'pri', name: "Pri"},
  {key: 'status', name: "Status"},
  {key: 'owner', name: "Owner"},
];

var handlers = {
  list: function () {
    return router.client.list(sheet).then(function (items) {
      var lines = items.map(row => `${row.id} ${row.name}`);
      return lines.join('\n');
    })
  },

  show: function (id) {
    return router.client.show(sheet, id).then(function (item) {
      var lines = fields.map(f => `${f.name}: ${item[f.key]}`);
      return lines.join('\n');
    })
  }
}

var defaultAction = 'list';

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

  var text = body.text || '';
  var words = text.split(/\s+/);
  var action = words[0];
  var args = words.slice(1);
  action = action || defaultAction;

  var handler = handlers[action];
  if (!handler) {
    var actions = Object.keys(handlers).join(', ');
    res.send(`I'm sorry, I don't know "${action}". Try one of these: ${actions}`);
    return;
  }

  handler.apply(null, args).then(function (reply) {
    res.send(reply);
  }).fail(function (error) {
    console.error('error handling command', error);
    next(error);
  })
})

module.exports = router;
