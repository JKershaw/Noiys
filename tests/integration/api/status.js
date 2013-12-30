/*jshint expr: true*/
var expect = require('chai').expect,
	assert = require('assert'),
	http = require('http'),
	request = require('request');;

require('chai').should();

describe('Getting from /status', function(done) {

	it("visiting /status gives a random status", function(done) {

		http.get('http://localhost:3000/status', function(res) {
			console.log("Got response: " + res.statusCode);

			res.on("data", function(chunk) {
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

	it("visiting /status/1234 gives a 404", function(done) {
		http.get('http://localhost:3000/status/1234', function(res) {
			console.log("Got response: " + res.statusCode);
			assert.equal(404, res.statusCode);
			done();
		});
	});
});

describe('Posting to /status', function(done) {

	var statusID, statusText = "This is a test status";

	it("with an invalid status gives a 400", function(done) {

		var post_details = {
			url: 'http://localhost:3000/status',
			form: {
				text: ""
			}
		}

		request.post(post_details, function(error, response, body) {
			assert.equal(400, response.statusCode);
			done();
		});
	});

	it("with a valid status gives a 200", function(done) {

		var post_details = {
			url: 'http://localhost:3000/status',
			form: {
				text: statusText
			}
		}

		request.post(post_details, function(error, response, body) {
			assert.equal(200, response.statusCode);
			statusID = body;
			done();
		});
	});

	describe("and we can get the status back", function(done) {
		it("visiting /status/[the ID] gives us the status back", function(done) {
			http.get('http://localhost:3000/status/' + statusID, function(res) {
				console.log("Got response: " + res.statusCode);
				assert.equal(200, res.statusCode);

				res.on("data", function(chunk) {
					data = JSON.parse(chunk);

					assert.equal(statusText, data.text);
					done();

				});
			});
		});
	});
});