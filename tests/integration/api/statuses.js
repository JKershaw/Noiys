/*jshint expr: true*/
var expect = require('chai').expect,
	assert = require('assert'),
	http = require('http'),
	request = require('request');;

require('chai').should();

describe('Getting from /statuses', function(done) {

	it("visiting /statuses returns a 200 with several statuses", function(done) {

		http.get('http://localhost:3000/statuses', function(res) {

			res.on("data", function(chunk) {
				data = JSON.parse(chunk);

				assert.equal(200, res.statusCode);
				assert.equal(true, data.length > 2);

				var always_older = true;

				for (var i = 0; i < data.length; i++) {
					expect(data[i].text).to.exist;
					expect(data[i].id).to.exist;
					expect(data[i].age).to.exist;
					expect(data[i].timestamp).to.exist;
					expect(data[i].ISO8601timestamp).to.exist;

					if (i > 0)
					{
						if (data[i].timestamp < data[i-1].timestamp)
						{
							always_older = false;
						}
					}
				}

				assert.equal(true, always_older);
				done();

			});
		});
	});

	it("visiting /statuses with a before", function(done) {

		var before_timestamp = Math.round(new Date().getTime() / 1000);
		http.get('http://localhost:3000/statuses?before='+before_timestamp, function(res) {

			res.on("data", function(chunk) {
				data = JSON.parse(chunk);

				assert.equal(200, res.statusCode);
				assert.equal(true, data.length > 2);

				var always_older = true;

				for (var i = 0; i < data.length; i++) {
					expect(data[i].text).to.exist;
					expect(data[i].id).to.exist;
					expect(data[i].age).to.exist;
					expect(data[i].timestamp).to.exist;
					expect(data[i].ISO8601timestamp).to.exist;

					if (i > 0)
					{
						if (data[i].timestamp < data[i-1].timestamp)
						{
							always_older = false;
						}
					}
				}

				assert.equal(true, always_older);
				done();

			});
		});
	});
});