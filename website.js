var express = require("express"),
	_ = require("underscore")._,
	app = express(),
	statusParser = require('./lib/StatusParser');

app.use(express.logger());
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.bodyParser());

require("./routes/home")(app);
require("./routes/status")(app);
require("./routes/statuses")(app);
require("./routes/vote")(app);

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
	console.log("Environment: ", process.env.environment);
});