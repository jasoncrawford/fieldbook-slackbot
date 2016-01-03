var express = require('express');
var bodyParser = require('body-parser');
var commands = require('./commands');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
  res.send("Fieldbook Slackbot");
})

app.use('/commands', commands);

var port = process.env['PORT'] || 3000;
app.listen(port, function () {
  console.log('listening on port', port);
});
