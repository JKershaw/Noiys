/*jshint expr: true*/
var expect = require('chai').expect,
	assert = require('assert'),
	http = require('http'),
	request = require('request');;

require('chai').should();

var statusText = "test";

describe('Getting from /search', function (done) {

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
					done();
				});
			}, 100);

		});
	});

	it("visiting /search with a nonexistant search query returns a 404", function (done) {

		http.get('http://localhost:3000/search/thissearchtermwillneverbefound', function (res) {

			assert.equal(404, res.statusCode);
			done();
		});
	});

	it("visiting /search with a good search string returns sorted results", function (done) {

		http.get('http://localhost:3000/search/test', function (res) {

			assert.equal(200, res.statusCode);

			res.on("data", function (chunk) {
				
				var data = JSON.parse(chunk);

				assert.equal(true, data.length == 2);

				assert.equal(true, data[0].timestamp <= data[1].timestamp);
				done();

			});
		});
	});
});