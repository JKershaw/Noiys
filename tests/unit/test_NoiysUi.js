var assert = require('assert'),
	NoiysUi = require('../../lib/NoiysUi'),
	expect = require('chai').expect;

require('chai').should();

var noiysUi = new NoiysUi();

var valid_status = {
	text: "@52d51beab2ff84020000000b\nYes classic introvert necessity behavior&#46; Downtime from chatty people especially&#46;",
	timestamp: new Date().getTime(),
	votes: 123,
	score: 21.93354166666667,
	parent: "52d51beab2ff84020000000b",
	ancestor: "52d51beab2ff84020000000b",
	id: "52d5639c33f5f4020000003a"
};

test("If there's no ID, generating a status row returns nothing", function(done) {

	var status = {};
	var generated_html = noiysUi.generate_icon_row_html(status, true);
	assert.equal(generated_html, "");
	done();

});


test("If there's a valid status given, generating a hidden status row html returns valid html", function(done) {
	var generated_html = noiysUi.generate_icon_row_html(valid_status, true);
	generated_html.should.contain('<li style=\"display: none\" class=\"list-group-item list-icon-row\">');
	done();
});

test("If there's a valid status given, generating a hidden status row html returns valid html", function(done) {
	var generated_html = noiysUi.generate_icon_row_html(valid_status, false);
	generated_html.should.contain('<li class=\"list-group-item list-icon-row\">');
	done();
});

test("Valid status given, status row html contains VERB code", function(done) {
	var generated_html = noiysUi.generate_icon_row_html(valid_status, false);
	generated_html.should.contain("<span style=\"font-weight:bold;\" class=\"votes votes-52d5639c33f5f4020000003a\">123</span>");
	generated_html.should.contain("<a class=\"button-vote\" data-id='52d5639c33f5f4020000003a' >VERB</a>");
	done();
});

test("Status with no vote value given, status row html contains no VERB code", function(done) {

	var status = {
		text: "@52d51beab2ff84020000000b\nYes classic introvert necessity behavior&#46; Downtime from chatty people especially&#46;",
		timestamp: new Date().getTime(),
		score: 21.93354166666667,
		parent: "52d51beab2ff84020000000b",
		ancestor: "52d51beab2ff84020000000b",
		id: "52d5639c33f5f4020000003a"
	};

	var generated_html = noiysUi.generate_icon_row_html(status, false);

	generated_html.should.not.contain("<span style=\"font-weight:bold;\" class=\"votes votes-52d5639c33f5f4020000003a\">123</span>");
	generated_html.should.not.contain("<a class=\"button-vote\" data-id='52d5639c33f5f4020000003a' >VERB</a>");
	done();
});


test("Valid status given, status row html contains timeago", function(done) {

	var generated_html = noiysUi.generate_icon_row_html(valid_status, false);

	var date = new Date(valid_status.timestamp * 1000);
	var ISO8601timestamp = date.toISOString();

	generated_html.should.contain("<small><span style=\"float:right;color:#888;\">posted <span class=\"timeago\" title=\"" + ISO8601timestamp + "\"></span></span></small>");
	done();
});

test("Status with no timestamp value given, status row html contains no timestamp code", function(done) {

	var status = {
		text: "@52d51beab2ff84020000000b\nYes classic introvert necessity behavior&#46; Downtime from chatty people especially&#46;",
		votes: 123,
		score: 21.93354166666667,
		parent: "52d51beab2ff84020000000b",
		ancestor: "52d51beab2ff84020000000b",
		id: "52d5639c33f5f4020000003a"
	};

	var generated_html = noiysUi.generate_icon_row_html(status, false);

	generated_html.should.not.contain("<span class=\"timeago\"");
	done();
});

test("Valid status given, generated status row html has reply button", function(done) {
	var generated_html = noiysUi.generate_icon_row_html(valid_status, false);
	generated_html.should.contain("<a class=\"button-reply\" data-id='52d5639c33f5f4020000003a'><span class=\"glyphicon glyphicon-retweet\"></a>");
	done();
});

test("Valid status given, generated status row html has link button", function(done) {
	var generated_html = noiysUi.generate_icon_row_html(valid_status, false);
	generated_html.should.contain("<a class=\"button-link\" target=\"_blank\" href=\"status/52d5639c33f5f4020000003a\"><span class=\"glyphicon glyphicon-link\"></a>");
	done();
});

test("Valid status given, want a hidden status html", function(done) {
	var generated_html = noiysUi.generate_status_html(valid_status, true, true);
	generated_html.should.contain("<div style=\"display: none\" class=\"panel panel-default status_panel id-" + valid_status.id + "\" timestamp=\"" + valid_status.timestamp + "\" id=\"" + valid_status.id + "\"");
	done();
});

test("Valid status given, want a visible status html", function(done) {
	var generated_html = noiysUi.generate_status_html(valid_status, false, true);
	generated_html.should.contain("<div class=\"panel panel-default status_panel id-" + valid_status.id + "\" timestamp=\"" + valid_status.timestamp + "\" id=\"" + valid_status.id + "\"");
	done();
});

test("Valid status given, response contains status html and icon row", function(done) {
	valid_status.html = "<strong>This is the HTML</strong>";
	var generated_html = noiysUi.generate_status_html(valid_status, false, true);

	var date = new Date(valid_status.timestamp * 1000);
	var ISO8601timestamp = date.toISOString();

	generated_html.should.contain(valid_status.html);
	generated_html.should.contain("<a class=\"button-link\" target=\"_blank\" href=\"status/52d5639c33f5f4020000003a\"><span class=\"glyphicon glyphicon-link\"></a>");
	generated_html.should.contain("<a class=\"button-reply\" data-id='52d5639c33f5f4020000003a'><span class=\"glyphicon glyphicon-retweet\"></a>");
	generated_html.should.contain("<small><span style=\"float:right;color:#888;\">posted <span class=\"timeago\" title=\"" + ISO8601timestamp + "\"></span></span></small>");
	generated_html.should.contain("<span style=\"font-weight:bold;\" class=\"votes votes-52d5639c33f5f4020000003a\">123</span>");
	generated_html.should.contain("<a class=\"button-vote\" data-id='52d5639c33f5f4020000003a' >VERB</a>");

	done();
});

test("Valid status given, response as reply contains status html and icon row", function(done) {
	valid_status.html = "<strong>This is the HTML</strong>";
	var generated_html = noiysUi.generate_status_as_reply_html(valid_status);

	var date = new Date(valid_status.timestamp * 1000);
	var ISO8601timestamp = date.toISOString();

	generated_html.should.contain(valid_status.html);
	generated_html.should.contain("<a class=\"button-link\" target=\"_blank\" href=\"status/52d5639c33f5f4020000003a\"><span class=\"glyphicon glyphicon-link\"></a>");
	generated_html.should.contain("<a class=\"button-reply\" data-id='52d5639c33f5f4020000003a'><span class=\"glyphicon glyphicon-retweet\"></a>");
	generated_html.should.contain("<small><span style=\"float:right;color:#888;\">posted <span class=\"timeago\" title=\"" + ISO8601timestamp + "\"></span></span></small>");
	generated_html.should.contain("<span style=\"font-weight:bold;\" class=\"votes votes-52d5639c33f5f4020000003a\">123</span>");
	generated_html.should.contain("<a class=\"button-vote\" data-id='52d5639c33f5f4020000003a' >VERB</a>");

	done();
});