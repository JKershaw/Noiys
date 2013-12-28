var assert = require('assert'),
	HTMLEncoder = require('../../lib/HTMLEncoder');

test("HTML is encoded", function(done) {
	
	var example_text = "Just text<>£$%\"<> @12345 #food #12;";

	HTMLEncoder().encode(example_text, function(encodedText) {
		console.log(example_text);
		console.log(encodedText);
		assert.notEqual(example_text, encodedText);
		done();
	});

});
