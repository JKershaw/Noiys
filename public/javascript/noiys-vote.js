define(['underscore', 'noise-api'], function(_, noiysApi) {

	var current_vote_count = [],
		vote_checker_timeout;

	function post(id) {
		var current_vote = parseInt($("#" + id + " .votes").first().text());

		current_vote_count[id] =  current_vote + 1;
		refresh(id);

		noiysApi.postVote(id, function(posted){});

	}

	function refresh(id) {
		$(".votes-" + id).text(current_vote_count[id]);
		$(".votes-" + id).css("color", "green");
	}

	function get_verb_and_vote_html(id, vote_count){

		current_vote_count[id] = vote_count;

		var vote_string = "<span style=\"font-weight:bold;\" class=\"votes votes-" + id + "\">" + vote_count + "</span>&nbsp;&nbsp; \
				<a style=\"cursor:pointer;\" class=\"button-vote\" data-id='" + id + "' >VERB</a>&nbsp;&nbsp;";

		return vote_string;
	}

	function check_all_votes(){
		console.log("Refreshing all votes");

		var keys = _.keys(current_vote_count);

		noiysApi.getRawStatusesFromIDs(keys, function(statuses) {
			if (statuses) {
				_.each(statuses, function(status){
					if (status.votes != current_vote_count[status.id])
					{
						current_vote_count[status.id] = status.votes;
						refresh(status.id);
					}
				});
			}
			vote_checker_timeout = setTimeout(check_all_votes, 5000);
		});
	}

	function inititalise_vote_updater() {
		vote_checker_timeout = setTimeout(check_all_votes, 5000);
	}

	return {
		post: post,
		get_verb_and_vote_html: get_verb_and_vote_html,
		check_all_votes: check_all_votes,
		inititalise_vote_updater: inititalise_vote_updater
	}
});