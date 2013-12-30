/*jshint expr: true*/
var expect = require('chai').expect,
	assert = require('assert'),
	http = require('http');

require('chai').should();

describe('Get a random status from /status', function(done) {

	it("visiting /status gives a 200", function(done) {

		http.get('http://localhost:3000/status', function(res) {
			console.log("Got response: " + res.statusCode);

			res.on("data", function(chunk) {
				data = JSON.parse(chunk);
				console.log(data);

				assert.equal(200, res.statusCode);
				expect(data.text).to.exist;
				expect(data.id).to.exist;
				expect(data.votes).to.exist;
				expect(data.age).to.exist;
				expect(data.timestamp).to.exist;
				expect(data.ISO8601timestamp).to.exist;

				done();

			});
		});
	});
});