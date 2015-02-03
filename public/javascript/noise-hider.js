define(['underscore', 'noise-api'], function(_, noiseApi) {
	
	var my_hidden = Array();
	
	function hide(statusID) {
		console.debug("hiding post");

		// add this to the list of hidden statuses
		my_hidden.push(statusID);
		perma_save_my_hidden();

		// hide all statuses with this data attrribute
		hide_all_hidden();
	}

	function hide_all_hidden(statusID) {
		for (var i = 0; i < my_hidden.length; i++) {
			$('*[data-noteID="' + statusID + '"]').hide();
		}
	}

	function is_hidden(statusID) {
		var index = my_hidden.indexOf(statusID);
		if (index > -1) {
			return true;
		} else {
			return false;
		}
	}

	function perma_save_my_hidden() {
		console.debug("perma save hidden");
		localStorage.my_hidden = JSON.stringify(my_hidden);
	}

	function perma_load_my_hidden() {
		console.debug("perma load hidden");
		if (localStorage.my_hidden) {
			my_hidden = JSON.parse(localStorage.my_hidden);
		}
	}

	function inititalise_my_hidden() {
		perma_load_my_hidden();
	}
	
	return {
		hide: hide,
		is_hidden: is_hidden,
		inititalise_my_hidden: inititalise_my_hidden,
		hide_all_hidden: hide_all_hidden
	}
});