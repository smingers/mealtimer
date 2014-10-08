var express = require("express");
var logfmt = require("logfmt");
var app = express();

app.use(logfmt.requestLogger());
app.use("/assets", express.static(__dirname + '/assets'));

app.get('/', function(request, response) {
 	response.sendfile(__dirname + '/client/index.html');
});

app.get('/recipe', function(request, response) {
   response.sendfile(__dirname + '/client/recipe.html');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log("Listening on " + port);
});
