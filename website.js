var express = require("express"),
	app = express(),
    path = require('path'),
	logger = require('morgan'),
    ROOT_DIRECTORY = __dirname,
    ASSETS_DIRECTORY = path.join(ROOT_DIRECTORY, 'public');

app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger());
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.bodyParser({strict:false}));
app.use(express.static(ASSETS_DIRECTORY));

app.use(logger('dev'));

require("./routes/home")(app);

require("./routes/status")(app);
require("./routes/statuses")(app);
require("./routes/vote")(app);
require("./routes/search")(app);

var port = process.env.PORT || 3000;

app.listen(port, function() {
	console.log("Listening on " + port);
	console.log("Environment: ", process.env.ENVIRONMENT);
});