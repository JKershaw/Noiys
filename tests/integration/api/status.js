/*jshint expr: true*/
var expect = require('chai').expect,
	assert = require('assert'),
	http = require('http'),
	request = require('request');

require('chai').should();

describe('Getting from /status', function (done) {

	it("visiting /status gives a random status", function (done) {

		http.get('http://localhost:3000/status', function (res) {
			console.log("Got response: " + res.statusCode);

			res.on("data", function (chunk) {
				data = JSON.parse(chunk);

				assert.equal(200, res.statusCode);
				expect(data.text).to.exist;
				expect(data.id).to.exist;
				expect(data.age).to.exist;
				expect(data.timestamp).to.exist;
				expect(data.ISO8601timestamp).to.exist;

				done();

			});
		});
	});

	it("visiting /status/1234 gives a 404", function (done) {

		var options = {
			port: 3000,
			hostname: 'localhost',
			path: '/status/1234',
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		};

		http.get(options, function (res) {
			console.log("Got response (wanted 404): " + res.statusCode);
			assert.equal(404, res.statusCode);
			done();
		});
	});
});

describe('Posting to /status', function (done) {

	var statusID, statusText = "This is a test status";

	it("with an empty status gives a 400", function (done) {

		var post_details = {
			url: 'http://localhost:3000/status',
			form: {
				text: ""
			}
		}

		request.post(post_details, function (error, response, body) {
			assert.equal(400, response.statusCode);
			done();
		});
	});
	it("with a blank status gives a 400", function (done) {

		var post_details = {
			url: 'http://localhost:3000/status',
			form: {
				text: "  "
			}
		}

		request.post(post_details, function (error, response, body) {
			assert.equal(400, response.statusCode);
			done();
		});
	});

	it("with a valid status gives a 200", function (done) {

		var post_details = {
			url: 'http://localhost:3000/status',
			form: {
				text: statusText
			}
		}

		request.post(post_details, function (error, response, body) {
			assert.equal(200, response.statusCode);
			statusID = body;
			done();
		});
	});

	describe("and we can get the status back", function (done) {
		it("visiting /status/[the ID] gives us the status back", function (done) {

			var options = {
				port: 3000,
				hostname: 'localhost',
				path: '/status/' + statusID,
				method: 'GET',
				headers: {
					'content-type': 'application/json'
				}
			};

			http.get(options, function (res) {
				console.log("Got response: " + res.statusCode);
				assert.equal(200, res.statusCode);

				res.on("data", function (chunk) {
					data = JSON.parse(chunk);
					console.log("data: ", data);

					assert.equal(statusText, data.text);
					done();

				});
			});
		});

		it("I can reply to the status", function (done) {

			var post_details = {
				url: 'http://localhost:3000/status',
				form: {
					text: "@" + statusID + "\n This is a magic reply!"
				}
			}

			request.post(post_details, function (error, response, body) {
				assert.equal(200, response.statusCode);
				replyStatusID = body;
				done();
			});
		});

		describe("and we can get the status back", function (done) {
			it("visiting /status/[the ID] gives us the status back", function (done) {
				var options = {
					port: 3000,
					hostname: 'localhost',
					path: '/status/' + replyStatusID,
					method: 'GET',
					headers: {
						'content-type': 'application/json'
					}
				};

				http.get(options, function (res) {
					assert.equal(200, res.statusCode);

					res.on("data", function (chunk) {
						data = JSON.parse(chunk);

						data.text.should.contain(statusText);
						assert.equal(data.ancestors[0], statusID);
						done();

					});
				});
			});

			it("I can reply to the status", function (done) {

				var post_details = {
					url: 'http://localhost:3000/status',
					form: {
						text: "@" + replyStatusID + "\n This is a second reply!"
					}
				}

				request.post(post_details, function (error, response, body) {
					assert.equal(200, response.statusCode);
					done();
				});
			});

			describe("and we can get the status back", function (done) {
				it("visiting /status/[the ID] gives us the status back with the same ancestor", function (done) {

					var options = {
						port: 3000,
						hostname: 'localhost',
						path: '/status/' + replyStatusID,
						method: 'GET',
						headers: {
							'content-type': 'application/json'
						}
					};

					http.get(options, function (res) {
						console.log("Got response: " + res.statusCode);
						assert.equal(200, res.statusCode);

						res.on("data", function (chunk) {
							data = JSON.parse(chunk);

							data.text.should.contain(statusText);
							assert.equal(data.ancestors[0], statusID);
							done();

						});
					});
				});
			});
		});
	});
});