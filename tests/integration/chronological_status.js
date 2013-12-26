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

	it("and I select the chronological tab some statuses appear", function() {
		browser.clickLink('#tab-chronological a', function() {
			browser.wait(browser.query('#chronological_statuses .status_panel'), function() {
				expect(browser.query('#chronological_statuses .status_panel')).to.exist;
			})

		});
	});
});