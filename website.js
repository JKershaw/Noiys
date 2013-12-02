var express = require("express");
var app = express();
app.use(express.logger());


app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.get('/', function(request, response) {
  response.render('index.html');
});

app.post('/status', function(request, response) {
	// save the response
  response.send(200);
});

app.get('/status', function(request, response) {
	// send the response
	message = {"text" : "This is a sample status. Woo stuff!"};

	response.contentType('json');
	response.send(message);


});


var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});