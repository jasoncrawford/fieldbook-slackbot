var express = require('express');
var bodyParser = require('body-parser');
var requestify = require('requestify');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
  res.send("Fieldbook Slackbot");
})

app.use('/commands', function (req, res, next) {
  var token = req.body && req.body.token;
  if (token === process.env['SLACK_COMMAND_TOKEN']) {
    next();
  } else {
    res.status(403).send("Error: Request token doesn't match SLACK_COMMAND_TOKEN");
  }
})

app.post('/commands', function (req, res, next) {
  var body = req.body;
  console.log(`got command from ${body.user_name}: ${body.command} ${body.text}`);

  requestify.get('https://api.fieldbook.com/v1/568896651bfd500300fa9a5f/items', {
    headers: {accept: 'application/json'},
    auth: {username: process.env['FIELDBOOK_KEY'], password: process.env['FIELDBOOK_SECRET']}
  }).then(function (response) {
    var items = JSON.parse(response.body);
    var lines = items.map(row => `${row.id} ${row.name}`);
    res.send(lines.join('\n'));
  }).fail(function (error) {
    console.error('error handling command', error);
    next(error);
  })
})

var port = process.env['PORT'] || 3000;
app.listen(port, function () {
  console.log('listening on port', port);
});
