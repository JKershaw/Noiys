define(['noise-api'], function(noiysApi) {

	function vote(id) {
		var current_vote = parseInt($("#" + id + " .votes").first().text());
		$(".votes-" + id).text(current_vote + 1);
		$(".votes-" + id).css("color", "green");

		noiysApi.postVote(id, function(posted){});
	}

	return {
		vote: vote
	}
});