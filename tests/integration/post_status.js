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

	it("and I select the chronological tab", function(done) {
		browser.clickLink('#tab-chronological a', function() {
			browser.wait(browser.query('#chronological_statuses .status_panel'), done);
		});
	});

	describe("and I want to post a status", function(done) {

		var expectedStatusMessage = "This is a fake status message, me old matey";
		
		before(function(done) {
			browser.fill('#statusText', expectedStatusMessage);
			browser.pressButton("#post_status");
			done();
		});

		it('the button says Posted', function() {
			browser.statusCode.should.equal(200);
		});
	});

});