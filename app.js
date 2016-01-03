var express = require('express');
var bodyParser = require('body-parser');

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

app.post('/commands', function (req, res) {
  var body = req.body;
  console.log(`got command from ${body.user_name}: ${body.command} ${body.text}`);
  res.send("OK");
})

var port = process.env['PORT'] || 3000;
app.listen(port, function () {
  console.log('listening on port', port);
});
