var assert = require('assert'),
	StatusParser = require('../../lib/StatusParser');

test("Basic text remains unchanged", function(done) {
	
	var status_text = "Sample text no quotes";

	StatusParser(status_text, function(parsed_text) {
		assert.equal(status_text, parsed_text);
		done();
	});

});

test("Text with an invalid quote results in no embedded bit", function(done) {
	var status_text = "@12345 Sample text with quote";

	StatusParser(status_text, function(parsed_text) {
		assert.equal(status_text, parsed_text);
		done();
	});
});

test("Text with a valid quote results in embedded bit", function(done) {
	
	var status_text = "@012345678901234567891234 Sample text with quote";

	StatusParser(status_text, function(parsed_text) {
		assert.notEqual(status_text, parsed_text);
		done();
	});

});

test("Text with a link in has the link turned into a real link", function(done) {
	var status_text = "Sample text with link http://google.com/food",
	expected_text = "Sample text with link <a href=\"http://google.com/food\" target=\"_blank\" rel=\"nofollow\">http://google.com/food</a>";

	StatusParser(status_text, function(parsed_text) {
		assert.equal(expected_text, parsed_text);
		done();
	});
});
