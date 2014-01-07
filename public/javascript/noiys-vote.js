define(['underscore', 'noise-api'], function(_, noiysApi) {

	var current_vote_count = [],
		vote_checker_timeout,
		voting = false;

	function post(id) {
		if (!voting)
		{
			$(".votes-" + id).text("--");
			
			voting = true;
			noiysApi.postVote(id, function(posted){
				voting = false;
				current_vote_count[id] =  current_vote_count[id] + 1;
				refresh(id);
			});
		}
	}

	function refresh(id) {
		$(".votes-" + id).text(current_vote_count[id]).css("color", "green");
	}

	function save_vote_count(id, vote_count) {
		current_vote_count[id] = parseInt(vote_count);
	}

	function check_all_votes(){
		console.log("Refreshing all votes");

		var keys = _.keys(current_vote_count);

		noiysApi.getRawStatusesFromIDs(keys, function(statuses) {
			if (statuses) {
				_.each(statuses, function(status){
					if (status.votes > current_vote_count[status.id])
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
		check_all_votes: check_all_votes,
		inititalise_vote_updater: inititalise_vote_updater,
		save_vote_count: save_vote_count
	}
});