define(['underscore', 'noise-api', 'noiys-vote-count'], function(_, noiysApi, noiysVoteCount) {

	var vote_checker_timeout,
		voting = false;

	function post(id) {
		if (!voting)
		{
			$(".votes-" + id).text("--");
			
			voting = true;
			noiysApi.postVote(id, function(posted){
				voting = false;
				noiysVoteCount.incriment_count(id);
				refresh(id);
			});
		}
	}

	function refresh(id) {
		$(".votes-" + id).text(noiysVoteCount.get_count(id)).css("color", "green");
	}

	function check_all_votes(){
		
		var keys = noiysVoteCount.get_statusIDs();

		//if (keys.length > 0) {
			console.log("Refreshing all votes: ", keys);

			noiysApi.getRawStatusesFromIDs(keys, function(statuses) {
				if (statuses) {
					_.each(statuses, function(status){
						if (status.votes != $(".votes-" + status.id).text())
						{
							noiysVoteCount.set_count(status.id, status.votes);
							refresh(status.id);
						}
					});
				}
				vote_checker_timeout = setTimeout(check_all_votes, 5000);
			});
		//}
	}

	function inititalise_vote_updater() {
		vote_checker_timeout = setTimeout(check_all_votes, 5000);
	}

	return {
		post: post,
		check_all_votes: check_all_votes,
		inititalise_vote_updater: inititalise_vote_updater
	}
});