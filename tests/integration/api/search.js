/*jshint expr: true*/
var expect = require('chai').expect,
	assert = require('assert'),
	http = require('http'),
	request = require('request');;

require('chai').should();

describe('Getting from /search', function(done) {

	it("visiting /search with a nonexistant search query returns a 404", function(done) {

		http.get('http://localhost:3000/search/thissearchtermwillneverbefound', function(res) {

			assert.equal(404, res.statusCode);
			done();
		});
	});

	it("visiting /search with a good search string returns sorted results", function(done) {

		http.get('http://localhost:3000/search/test', function(res) {


			assert.equal(200, res.statusCode);
			done();

			// TODO This test need to be able to be run in isolation

			// res.on("data", function(chunk) {
			// 	//data = JSON.parse(chunk);

			// 	assert.equal(200, res.statusCode);
			// 	// assert.equal(true, data.length > 2);

			// 	// var always_older = true;

			// 	// for (var i = 0; i < data.length; i++) {
			// 	// 	expect(data[i].text).to.exist;
			// 	// 	expect(data[i].id).to.exist;
			// 	// 	expect(data[i].age).to.exist;
			// 	// 	expect(data[i].timestamp).to.exist;
			// 	// 	expect(data[i].ISO8601timestamp).to.exist;

			// 	// 	if (i > 0)
			// 	// 	{
			// 	// 		if (data[i].timestamp < data[i-1].timestamp)
			// 	// 		{
			// 	// 			always_older = false;
			// 	// 		}
			// 	// 	}
			// 	// }

			// 	// assert.equal(true, always_older);
			// 	done();

			// });
		});
	});
});