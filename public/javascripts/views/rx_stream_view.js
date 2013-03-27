define([
	'backbone',
	'underscore'
], function(Backbone, _) {
	var RXStreamView = Backbone.View.extend({
		
		initialize: function(options) {
			_.bindAll(this, 'receiveStream', 'update','finish','handleError');
			console.log(options)
			this.parts = [];
			this.metadata = options.meta;
			this.stream = options.stream;
			this.view = options.view;
			this.receiveStream();
		},
		
		receiveStream: function(stream, meta) {
			this.dispatcher.trigger("changeMode","RX");	
			this.stream.on('data', this.update);
			this.stream.on('error', this.handleError);
			this.stream.on('end',this.finish);
		},
		
		update: function (data) {
			var level = Math.round(data.byteLength / this.metadata.size * 100,1); 

			this.dispatcher.trigger("transmissionProgress", level);
			this._appendPart(data);
		},
		
		finish: function() {
			var download = this._createFileDownload();
			
      $('body').append(download);
			this.dispatcher.trigger('transmissionEnd');
      this._force(download[0],'click');
			this._cleanup();
		},
		
		handleError: function() {
			console.log('i err\'d :(');
			console.log(arguments);
		},
		
		_force: function(target, eventType) {
    	var evt = document.createEvent('Event');
      
			evt.initEvent(eventType, true, true);
      target.dispatchEvent(evt);
    },
		
		_appendPart: function(data) {
			this.parts.push(data);
		},
		
		_cleanup: function() {
			this.parts = [];
			this.view.close();
     	return this.stream.destroy();
		},
		
		_createFileDownload: function() {
			var file = new Blob(this.parts,{
						type: typeof this.metadata.mime === String && this.metadata.mime || ""
					}),
      		url = window.webkitURL.createObjectURL(file);
      
			return $('<a download="'+this.metadata.name+'" href="'+url+'" id="download"></a>');
		}
 	});
	
	return RXStreamView;
});