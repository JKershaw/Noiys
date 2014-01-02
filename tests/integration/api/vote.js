/*jshint expr: true*/
var expect = require('chai').expect,
	assert = require('assert'),
	http = require('http'),
	request = require('request');

require('chai').should();

describe('Voting on a status', function(done) {

	var statusID, options, statusText = "This is a test status for voting",
		statusVotes = 0;

	it("I save a text and get the ID", function(done) {

		var post_details = {
			url: 'http://localhost:3000/status',
			form: {
				text: statusText
			}
		}

		request.post(post_details, function(error, response, body) {
			assert.equal(200, response.statusCode);
			statusID = body;
			options = {
					port: 3000,
					hostname: 'localhost',
					path: '/status/' + statusID,
					method: 'GET',
					headers: {
						'content-type': 'application/json'
					}
				};
			done();
		});
	});

	describe("Given I vote on a specific status", function(done) {
		it("POST to /vote returns a 200", function(done) {
			var post_details = {
				url: 'http://localhost:3000/vote',
				form: {
					id: statusID
				}
			}

			request.post(post_details, function(error, response, body) {
				assert.equal(200, response.statusCode);
				done();
			});
		});


		describe("and we can get the status back with 1 vote", function(done) {
			it("visiting /status/[the ID] gives us the status back", function(done) {

				

				http.get(options, function(res) {
					console.log("Got response: " + res.statusCode);
					assert.equal(200, res.statusCode);

					res.on("data", function(chunk) {
						data = JSON.parse(chunk);

						assert.equal(statusText, data.text);
						assert.equal(1, data.votes);
						done();

					});
				});
			});

			describe("Given I vote AGAIN on a specific status", function(done) {
				it("POST to /vote returns a 200", function(done) {
					var post_details = {
						url: 'http://localhost:3000/vote',
						form: {
							id: statusID
						}
					}

					request.post(post_details, function(error, response, body) {
						done();
					});
				});

				describe("and we can get the status back with 2 vote", function(done) {
					it("visiting /status/[the ID] gives us the status back", function(done) {
						http.get(options, function(res) {
							console.log("Got response: " + res.statusCode);
							assert.equal(200, res.statusCode);

							res.on("data", function(chunk) {
								data = JSON.parse(chunk);
								assert.equal(2, data.votes);
								done();

							});
						});
					});
				});
			});
		});
	});
});