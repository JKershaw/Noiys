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

	it("then the random tab is selected by default", function() {
		expect(browser.query('#tab-random.active')).to.exist;
		expect(browser.query('#tab-chronological.active')).not.to.exist;
	});

	it("a random status appears", function() {
							
		browser.wait(browser.query('#random_statuses .status_panel'), function() {
			expect(browser.query('#random_statuses .status_panel')).to.exist;
		});
	});
});