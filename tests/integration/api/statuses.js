/*jshint expr: true*/
var expect = require('chai').expect,
	assert = require('assert'),
	http = require('http'),
	request = require('request');;

require('chai').should();

var statusText = "Aww yeah";

describe('Getting from /statuses', function (done) {

	before(function (done) {
		var post_details = {
			url: 'http://localhost:3000/status',
			form: {
				text: statusText
			}
		}

		request.post(post_details, function (error, response, body) {

			setTimeout(function () {
				var post_details = {
					url: 'http://localhost:3000/status',
					form: {
						text: statusText
					}
				}

				request.post(post_details, function (error, response, body) {

					setTimeout(function () {
						var post_details = {
							url: 'http://localhost:3000/status',
							form: {
								text: statusText
							}
						}

						request.post(post_details, function (error, response, body) {
							done();
						});
					}, 100);

				});
			}, 100);

		});
	});

	it("visiting /statuses returns a 200 with several statuses", function (done) {

		http.get('http://localhost:3000/statuses', function (res) {

			res.on("data", function (chunk) {
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

					if (i > 0) {
						if (data[i].timestamp < data[i - 1].timestamp) {
							always_older = false;
						}
					}
				}

				assert.equal(true, always_older);
				done();

			});
		});
	});

	it("visiting /statuses?raw=true returns a 200 with several raw statuses", function (done) {

		http.get('http://localhost:3000/statuses?raw=true', function (res) {

			res.on("data", function (chunk) {
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
				}

				done();

			});
		});
	});

	it("visiting /statuses for the home feed returns a 200 with several statuses", function (done) {

		http.get('http://localhost:3000/statuses?home=true', function (res) {

			res.on("data", function (chunk) {
				data = JSON.parse(chunk);

				assert.equal(200, res.statusCode);
				assert.equal(true, data.length > 2);

				for (var i = 0; i < data.length; i++) {
					expect(data[i].text).to.exist;
					expect(data[i].id).to.exist;
					expect(data[i].age).to.exist;
					expect(data[i].timestamp).to.exist;
					expect(data[i].ISO8601timestamp).to.exist;

				}
				done();

			});
		});
	});

	it("visiting /statuses with a before", function (done) {

		var before_timestamp = Math.round(new Date().getTime() / 1000);
		http.get('http://localhost:3000/statuses?before=' + before_timestamp, function (res) {

			res.on("data", function (chunk) {
				data = JSON.parse(chunk);

				assert.equal(200, res.statusCode);
				assert.equal(true, data.length > 1);

				var always_older = true;

				for (var i = 0; i < data.length; i++) {
					expect(data[i].text).to.exist;
					expect(data[i].id).to.exist;
					expect(data[i].age).to.exist;
					expect(data[i].timestamp).to.exist;
					expect(data[i].ISO8601timestamp).to.exist;

					if (i > 0) {
						if (data[i].timestamp < data[i - 1].timestamp) {
							always_older = false;
						}
					}
				}

				assert.equal(true, always_older);
				done();

			});
		});
	});

	it("I can get multiple statuses back from /statuses/ID1,ID2", function (done) {

		var status1ID, status2ID;

		var post_details = {
			url: 'http://localhost:3000/status',
			form: {
				text: "Status 1"
			}
		};
		var post2_details = {
			url: 'http://localhost:3000/status',
			form: {
				text: "Status 2"
			}
		};

		request.post(post_details, function (error, response, body) {
			status1ID = body;
			request.post(post2_details, function (error, response, body) {
				status2ID = body;
				http.get('http://localhost:3000/statuses?IDs=' + status1ID + "," + status2ID, function (res) {
					assert.equal(200, res.statusCode);

					res.on("data", function (chunk) {
						data = JSON.parse(chunk);

						assert.equal("Status 1", data[0].text);
						assert.equal("Status 2", data[1].text);
						done();

					});
				});
			});
		});
	});
});