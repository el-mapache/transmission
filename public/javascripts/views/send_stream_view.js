define(['backbone','underscore'], function(Backbone,_) {
	var SendStreamView = Backbone.View.extend({
		initialize: function(view) {
			_.bindAll(this,'onStreamData','onStreamClose','onStreamError')

			this.file = view.model;
			this.view = view;
			this.stream = null;
			this.dispatcher.trigger("changeMode","TX");
			this.openStream();
		},

		openStream: function() {
			var self = this;

			this.stream = this.binaryClient.send(this.file.get('file'),{
				type: "transmission" ,
				name: self.file.get('name'),
				size: self.file.get('size'),
				mime: self.file.get('type')
			});
			this.stream.on('data',this.onStreamData);
			this.stream.on('close', this.onStreamClose);
			this.stream.on('error',this.onStreamError);
		},

		onStreamData: function (data) {
			var level = Math.round(data.rx * 100, 1);
			this.dispatcher.trigger('transmissionProgress',level);
		},

		onStreamClose: function() {
			console.log('closed');
			this.dispatcher.trigger('transmissionEnd');
			delete this.file;
			this.view.close();
			return delete this.stream;
		},

		onStreamError: function() {
			console.log('i err\'d :(');
			console.log(arguments);
		}
	});

	return SendStreamView;
});
