define(['jquery'], function($) {

	function show_error() {
		var error_text="Ah crap, lost connection to the server. It'll probably come back soon.";
		$("#main_error").html(error_text).show();
	}

	function hide_error() {
		$("#main_error").hide();
	}

	return {
		show_error: show_error,
		hide_error: hide_error,
	}
});