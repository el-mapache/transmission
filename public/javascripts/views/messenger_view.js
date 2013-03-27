define([
	'backbone',
	'underscore',
	'binary'
], function(Backbone, _, Binary) {
	var MessengerView = Backbone.View.extend({
		
		initialize: function() {
			_.bindAll(this,'_dispatch', '_openMessageStream','sendMessage');

			this.binaryClient.on('open', this._openMessageStream);
			this.dispatcher.on('sendMessage',this.sendMessage);
		},

		_openMessageStream: function() {
			this.messenger = this.binaryClient.createStream({type: "message"});
			this.messenger.on('data', this._dispatch); 
		},
		
		_dispatch: function(data) {
			console.log(data)
			switch(data.data) {
				case "numClients":
					this.dispatcher.trigger('changeClientCount', data.clients);
					break;
				case "transmitOK":
					this.dispatcher.trigger('sendFile');
					break;
				case "locked":
					//show tooltip, someone else is streaming
					break;
				case "isNext":
					this.dispatcher.trigger('sendFile');
					break;
			}
		},
		
		sendMessage: function(msgEvt) {
			this.messenger.write({event: msgEvt});
		}
	});
	
	return MessengerView;
});