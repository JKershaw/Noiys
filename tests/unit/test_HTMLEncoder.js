var assert = require('assert'),
	HTMLEncoder = require('../../lib/HTMLEncoder');

test("text and numbers are not encoded", function(done) {
	
	var example_text = "0123456789 qaz erry sdgh sgj";

	HTMLEncoder().encode(example_text, function(encodedText) {
		assert.equal(example_text, encodedText);
		done();
	});

});

test("hashes are encoded", function(done) {
	
	var example_text = "#hashing is fun",
		expected_text = "&#35;hashing is fun";

	HTMLEncoder().encode(example_text, function(encodedText) {
		assert.equal(expected_text, encodedText);
		done();
	});

});

test("HTML is encoded", function(done) {
	
	var example_text = "Just text<>£$%\"<> @12345 #food #12;",
		expected_text = "Just text&#60;&#62;&#163;&#36;&#37;&#34;&#60;&#62; @12345 &#35;food &#35;12&#59;";

	HTMLEncoder().encode(example_text, function(encodedText) {
		assert.equal(encodedText, expected_text);
		done();
	});

});
