define(['noise-api'], function(noiysApi) {

	var manual_pause = false
		auto_pause = false;

	function toggle_manual_pause() {
		manual_pause = !manual_pause;

		if (manual_pause === false) {
			$('#pause_feed').text("Pause Feed");
		} else {
			$('#pause_feed').text("Un-pause Feed");
		}
	}

	function set_auto_pause(new_state) {
		console.debug("auto pause set to ", new_state);
		auto_pause = new_state;
	}

	function is_manually_paused() {
		return manual_pause;
	}

	function is_auto_paused() {
		return auto_pause;
	}

	function is_paused() {
		return (auto_pause || manual_pause);
	}

	return {
		toggle_manual_pause: toggle_manual_pause,
		set_auto_pause: set_auto_pause,
		is_manually_paused: is_manually_paused,
		is_auto_paused: is_auto_paused,
		is_paused: is_paused
	}
});