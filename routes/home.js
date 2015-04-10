var NoiysDatabase = require('../lib/NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING);

module.exports = function(app) {
	app.get('/', function(request, response) {
		noiysDatabase.removeOldStatuses(function() {
			var model = {
					firebug: false,
					environment: process.env.ENVIRONMENT
			};
			
			if (request.query['firebug'])
			{
				model = {
					firebug: true,
					environment: process.env.ENVIRONMENT
				};
			}
			response.render('index.ejs', model);
		});
	});
};