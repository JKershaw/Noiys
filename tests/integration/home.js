/*jshint expr: true*/
var expect = require('chai').expect,
	assert = require('assert'),
	Browser = require('zombie');

require('chai').should();

var baseUri = process.env.BASE_URI,
	browser = new Browser({
		site: baseUri
	});

describe('Given I visit the root URL', function(done) {

	before(function(done) {
		browser.visit('/', done);
	});

	it("then the page loads fine", function() {
		browser.statusCode.should.equal(200);
	});
});