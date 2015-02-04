define(['underscore', 'noise-api'], function(_, noiseApi) {
	
	var my_hidden = Array();
	
	function hide(statusID) {

		// add this to the list of hidden statuses
		my_hidden.push(statusID);
		perma_save_my_hidden();

		// hide all statuses with this data attrribute
		hide_all_hidden();
	}

	function hide_all_hidden() {

		var nidden_string = "<span style=\"color: grey;\"><i>Note hidden. Nidden.</i></span>";
		var nidden_html = " \
			<div class=\"panel-body\">" + nidden_string + "</div> \
			";
		var nidden_ul = " \
			<li class=\"list-group-item list-status\">" + nidden_string + "</li> \
			";

		for (var i = 0; i < my_hidden.length; i++) {
			$('.panel[data-noteID="' + my_hidden[i] + '"]').html(nidden_html);
			$('li[data-noteID="' + my_hidden[i] + '"]').html(nidden_string);
			$('ul[data-noteID="' + my_hidden[i] + '"]').html(nidden_ul);
		}
	}

	function perma_save_my_hidden() {
		localStorage.my_hidden = JSON.stringify(my_hidden);
	}

	function perma_load_my_hidden() {
		if (localStorage.my_hidden) {
			my_hidden = JSON.parse(localStorage.my_hidden);
		}
	}

	function inititalise_my_hidden() {
		perma_load_my_hidden();
	}
	
	return {
		hide: hide,
		inititalise_my_hidden: inititalise_my_hidden,
		hide_all_hidden: hide_all_hidden
	}
});