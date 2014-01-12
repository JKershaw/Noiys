var NoiysDatabase = require('../lib/NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	_ = require("underscore")._,
	StatusMessageFactory = require('../lib/StatusMessageFactory'),
	NoiysFeed = require('../lib/NoiysFeed'),
	noiysFeed = new NoiysFeed();

module.exports = function(app) {

	var number_of_statuses = 20;

	app.get('/statuses', function(request, response) {

		console.log("GETTING statuses =>", request.query);

		if (request.query['before'] && (request.query['before'] !== "undefined")) {
			noiysDatabase.findStatusesBefore(request.query['before'], number_of_statuses, function(statuses) {
				handle_returned_statuses(statuses, response, (request.query['raw'] == "true"));
			});
		} else if(request.query['IDs'] && (request.query['IDs'] !== "undefined")) {
			noiysDatabase.getStatusesFromIDs(request.query['IDs'].split(","), function(statuses) {
				handle_returned_statuses(statuses, response, (request.query['raw'] == "true"));
			});
		} else if(request.query['parentID'] && (request.query['parentID'] !== "parentID")) {

			noiysDatabase.findStatus(request.query.parentID, function(status) {
				handle_returned_parent_status(status, response);
			});

		} else if(request.query['home'] == "true") {
			handle_home_statuses(request, response);
		} else {
			noiysDatabase.findRecentStatuses(number_of_statuses, function(statuses) {
				handle_returned_statuses(statuses, response, (request.query['raw'] == "true"));
			});
		}
	});

	app.get('/statuses/feed', function(request, response) {
		console.log("GETTING FEED");

		noiysFeed.getStatuses(function(statuses) {
			handle_returned_statuses(statuses, response);
		});
		
	});
};

function handle_home_statuses(request, response) {

	noiysDatabase.getStatuses(function(statuses) {

		// sort by score
		statuses.sort(function compare(a, b) {
			if (a.score > b.score) return -1;
			if (a.score < b.score) return 1;
			return 0;
		});

		// leave only the highest scored status from any given conversation
		var seen_conversation_ids = [];
		var tmp_statuses = [];

		console.log(statuses.length);

		for(var i=0;i<statuses.length;i++) {
			
			//console.log("Looking for: ", statuses[i].ancestor);
			
			if ((statuses[i].ancestor == undefined) || seen_conversation_ids.indexOf(statuses[i].ancestor) == -1) {
				if (statuses[i].ancestor) {
					seen_conversation_ids.push(statuses[i].ancestor);
				} else {
					seen_conversation_ids.push(statuses[i].id);
				}
				tmp_statuses.push(statuses[i]);
				//console.log("NEW", seen_conversation_ids);
			} else {
				console.log("OLD");
			}
		}

		statuses = tmp_statuses;
		console.log(statuses.length);

		// get the top 20 remaining posts
		statuses = statuses.slice(0, 20);
		console.log(statuses.length);

		var messages = new Array(),
			statusMessageFactory = new StatusMessageFactory();

		var finished = _.after(statuses.length, function() {

			messages.sort(function compare(a, b) {
				if (a.score > b.score) return -1;
				if (a.score < b.score) return 1;
				return 0;
			});

			response.contentType('json');
			response.send(messages);
		});

		_.each(statuses, function(status) {
			statusMessageFactory.create(status, function(message) {
				messages.push(message);
				finished();
			});
		});
	});
}

function handle_returned_statuses(statuses, response, raw) {
	
	if(!statuses || statuses.length ==0){
		response.send(404);
	}

	var messages = new Array(),
		statusMessageFactory = new StatusMessageFactory();

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
		if (raw) {
			statusMessageFactory.createRaw(status, function(message) {
				messages.push(message);
				finished();
			});
		} else {
			statusMessageFactory.create(status, function(message) {
				messages.push(message);
				finished();
			});
		}
	});
	
}

function handle_returned_parent_status(status, response) {
	var statusMessageFactory = new StatusMessageFactory();

	statusMessageFactory.createAsParent(status, function(message) {
		response.contentType('json');
		response.send(message);
	});

}