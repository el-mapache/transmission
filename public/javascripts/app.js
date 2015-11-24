define([
  'underscore',
  'jquery',
  'backbone',
  'bootstrap',
  'binary',
  'views/file_view',
  'models/file',
  'mixins/progress_bar',
  'views/rx_stream_view',
  'router'
], function(_, $, Backbone, Bootstrap, Binary, FileView, File, ProgressBar, RXStreamView, router) {
	return {
		initialize: function() {

      // Global event buss mediates communication between views
			Backbone.View.prototype.dispatcher = _.extend({},Backbone.Events);

      // Most views need to know the client count, and I was too lazy to
      // have them all message each other for it
			Backbone.View.prototype.clientCount = 0;

      // See above
			//Backbone.View.prototype.binaryClient = new BinaryClient('ws://txrx.availableforfriendship.com:19874');
			Backbone.View.prototype.binaryClient = new BinaryClient('ws://localhost:9000');
			//Backbone.View.prototype.binaryClient = new BinaryClient('ws://192.168.0.2:9000');
			//http://192.168.0.2:9000/room/092c87-f4-244-d41-223d990d

      // Mix in the progress bar mixin
			_.extend(FileView.prototype, ProgressBar);

      new router();
		}
	};
});
