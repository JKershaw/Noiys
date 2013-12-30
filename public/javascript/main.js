// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones,
requirejs.config({
	baseUrl: "javascript",
	paths: {
		jquery: "//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min",
		bootstrap: "//netdna.bootstrapcdn.com/bootstrap/3.0.2/js/bootstrap.min",
		timeago: "lib/timeago"
	},
	shim: {
		timeago: {
			deps: ["jquery"]
		},
		bootstrap: {
			deps: ["jquery"]
		}
	}
});

// Load the main app module to start the app
requirejs(["app"]);