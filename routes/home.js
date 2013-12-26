var NoiysDatabase = require('../NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING);

module.exports = function(app) {
	app.get('/', function(request, response) {
		noiysDatabase.removeOldStatuses(function() {
			response.render('index.html');
		});
	});
};