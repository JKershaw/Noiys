var connection_string = "mongodb://noiys:e4bfe4e70b7c76b0299eac37639555fd@paulo.mongohq.com:10035/noiys",
	NoiysDatabase = require('../NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(connection_string);

module.exports = function(app) {
	app.get('/', function(request, response) {
		noiysDatabase.removeOldStatuses(function() {
			response.render('index.html');
		});
	});
};