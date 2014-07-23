// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones,
requirejs.config({
	waitSeconds: 30,
	baseUrl: "javascript",
	paths: {
		jquery: "//code.jquery.com/jquery-1.10.2.min.js",
		bootstrap: "//netdna.bootstrapcdn.com/bootstrap/3.0.2/js/bootstrap.min",
		timeago: "lib/timeago",
		underscore: "lib/underscore"
	},
	shim: {
		underscore: {
			exports: '_'
		},
		timeago: {
			deps: ["jquery"]
		},
		bootstrap: {
			deps: ["jquery"]
		},
		app: {
			deps: ["timeago", "bootstrap"]
		}
	}
});

// Load the main app module to start the app
requirejs(["app"]);