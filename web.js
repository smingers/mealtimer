var express = require("express");
var logfmt = require("logfmt");
var app = express();
var http = require('http');
var fs = require('fs');

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
 	res.send('coming soon...');

 	fs.readFile('/html/home.html', function(err, contents) {
    response.write(contents);
    response.end();
  });

});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log("Listening on " + port);
});