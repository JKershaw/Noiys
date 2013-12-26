var express = require("express"),
	_ = require("underscore")._,
	app = express(),
	statusParser = require('./lib/StatusParser');

app.use(express.logger());
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.bodyParser());

//var connection_string = "mongodb://noiys:e4bfe4e70b7c76b0299eac37639555fd@paulo.mongohq.com:10035/noiys";
var NoiysDatabase = require('./NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	StatusMessageFactory = require('./lib/StatusMessageFactory');

require("./routes/home")(app);
require("./routes/status")(app);

app.get('/statuses', function(request, response) {

	var statusMessageFactory = new StatusMessageFactory();

	console.log("GETTING recent statuses");

	noiysDatabase.findRecentStatuses(20, function(statuses) {

		var messages = new Array();

		var finished = _.after(statuses.length, function() {

			messages.sort(function compare(a, b) {
				if (a.timestamp < b.timestamp) return -1;
				if (a.timestamp > b.timestamp) return 1;
				return 0;
			});

			response.contentType('json');
			response.send(messages);
		});

		_.each(statuses, function(status) {
			statusMessageFactory.create(status, function(message){
				messages.push(message);
				finished();
			});
		});
	});
});

app.post('/vote', function(request, response) {
	console.log("POSTING a vote");

	noiysDatabase.findStatus(request.body.id, function(status) {
		if (status) {
			status.votes = status.votes + 1;
			noiysDatabase.saveStatus(status, function() {});
			response.send(200);
		} else {
			response.send(404);
		}
	});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
	console.log("Environment: ", process.env.environment);
	console.log("Mongo: ", process.env.MONGO_CONNECTION_STRING);
});