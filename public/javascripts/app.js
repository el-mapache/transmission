define(['underscore',
				'jquery',
				'backbone',
				'bootstrap',
				'binary',
				'views/file_view',
				'models/file',
				'mixins/progress_bar',
				'views/messenger_view',
				'views/rx_stream_view',
				'views/hud_view',
				'views/queue_view',
				'views/tool_tip_view'
], function(_,$,Backbone,Bootstrap,Binary,FileView,File,ProgressBar,MessengerView,RXStreamView,HudView,QueueView,ToolTipView) {
	return {
		initialize: function() {
      // Global event buss mediates communication between views
			Backbone.View.prototype.dispatcher = _.extend({},Backbone.Events);
      // Most views need to know the client count, and I was too lazy to have them all message each other for it
			Backbone.View.prototype.clientCount = 0;
      // See above
			Backbone.View.prototype.binaryClient = new BinaryClient('ws://localhost:9000');
      // Mix in the progress bar mixin
			_.extend(FileView.prototype, ProgressBar);

			new MessengerView();
			new QueueView();
			new HudView().render().el;
			new ToolTipView().render().el;
		}
	};
});
