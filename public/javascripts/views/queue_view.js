define(['backbone','underscore','models/file','views/file_view','views/send_stream_view',
'views/rx_stream_view'
], function(Backbone, _, File, FileView,SendStreamView,RXStreamView) {
	var QueueView = Backbone.View.extend({
		el: "#tx-drop-box",
		events: {
			'dragenter': '_doNothing',
			'dragover': '_doNothing',
			'drop': 'handleDrop'
		},
		
		initialize: function() {
			_.bindAll(this,'sendFile','nextOrEnd','handleDrop','createFileView','receiveFile');
			this.queue = [];
			this.fileView = null;
			this.binaryClient.on('stream',this.receiveFile);
			this.transmitting = false;
			this.dispatcher.on('sendFile',this.sendFile);
			this.dispatcher.on('transmissionEnd', this.nextOrEnd);
		},
		
		render: function() {
			this.$el.append(this.fileView.render().el);
			return this;
		},
		
		handleDrop: function(evt) {
			evt.preventDefault();
			
			if(this.queue.length === 3) {
				return this.dispatcher.trigger('showTooltip','queueMaxed');
			}

			this.createFileView(evt.originalEvent.dataTransfer.files[0],"up");
			
			if(this.clientCount === 0) {
				this.dispatcher.trigger('showTooltip','noClients');
			}
			
			this.queue.push(this.fileView);
			this.dispatcher.trigger("sendMessage","beforeTransmit");
		},
		
		sendFile: function() {
			if(this.transmitting) return false;
			
			this.transmitting = true;
			console.log('about to stream')
			new SendStreamView(this.queue[0]);
		},
		
		receiveFile: function(stream,meta) {
			this.createFileView(meta,"down");
			new RXStreamView({stream: stream, meta: meta,view: this.fileView});
		},
		
		nextOrEnd: function() {
			this.queue.splice(0,1);

			if(this.queue.length === 0) return this.transmitting = false;
			
			this.sendFile();
		},
		
		createFileView: function(file,type) {
			this.$el.append('<div class="tx-file clearfix"></div>')
      console.log(file)
			this.fileView = new FileView({
				model: new File(file),
				type: type,
				el: $('.tx-file:last')
			});
			
			return this.render();
		},
		
		_doNothing: function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
		}
 	});
	
	return QueueView;
});