define([
	'backbone',
	'underscore',
	'models/file'
], function(Backbone, _, File) {
  // Queue is made up of file objects
	var Queue = Backbone.Collection.extend({
		model: File
	});

	return Queue;
});
