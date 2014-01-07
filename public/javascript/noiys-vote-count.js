define(['underscore'], function(_) {

	var current_vote_count = [];

	function get_count(id) {
		return current_vote_count[id];
	}
	
	function set_count(id, vote_count) {
		current_vote_count[id] = vote_count;
	}
	
	function incriment_count(id) {
		current_vote_count[id] = current_vote_count[id] + 1;
	}

	function get_statusIDs() {
		return _.keys(current_vote_count);;
	}

	function set_count_from_status(status) {
		current_vote_count[status.id] = status.votes;
	}

	function set_count_from_statuses(statuses) {
		for(var i=0;i<statuses.length;i++) {
			current_vote_count[statuses[i].id] = statuses[i].votes;
		}
	}

	return {
		get_count: get_count,
		set_count: set_count,
		incriment_count: incriment_count,
		get_statusIDs: get_statusIDs,
		set_count_from_status: set_count_from_status,
		set_count_from_statuses: set_count_from_statuses
	}
});