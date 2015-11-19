require.config({
  baseUrl: '/javascripts/',
  paths: {
    jquery:        		'vendor/jquery.min',
    underscore:    		'vendor/underscore.min',
    backbone:      		'vendor/backbone',
    text:          		'vendor/text.min',
    json2:         		'vendor/json2',
    templates:     		'templates',
	  bootstrap:        'vendor/bootstrap',
	  binary:           "vendor/binary",
	  app:              "app"
  },
  shim: {
   underscore: {
      exports: '_'
    },

    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },

		bootstrap: {
			deps: ['jquery'],
			exports: 'jquery'
		},
		
		app: {
			deps: ['binary']
		}
	}
});

require(['app', 'json2'], function(app) {
 	app.initialize();
});
