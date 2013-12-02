var express = require("express");
var app = express();
app.use(express.logger());


app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.get('/', function(request, response) {
  res.render('index.htm');
});

app.post('/status', function(request, response) {
	// save the response
  response.send(200);
});

app.get('/status', function(request, response) {
	// save the response
  response.send("This is a status");
});


var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});