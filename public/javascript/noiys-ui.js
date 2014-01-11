define([], function() {

	function generate_show_quote_html(id) {
		return "<div class=\"show_quote_link panel panel-default status_panel\"> \
					<div class=\"panel-body\"> \
						<a class=\"button-show-hidden-quote\" data-id=\"" + id + "\"> \
							Show quote \
						</a> \
					</div> \
				</div>";
	}

	return {
		generate_show_quote_html: generate_show_quote_html
	}
});