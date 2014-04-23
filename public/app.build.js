({
  baseUrl: 'javascripts/',
  appdir: "javascripts",
  out: "production.js",
  include: ['base'],
  optimize: "uglify",
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
})
