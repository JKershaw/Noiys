var NoiysDatabase = require('../NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING);

module.exports = function(app) {
	app.get('/', function(request, response) {
		noiysDatabase.removeOldStatuses(function() {
			var model = {firebug: false};
			if (request.query['firebug'])
			{
				model = {firebug: true};
			}
			response.render('index.ejs', model);
		});
	});
};