// TODO MAYBE DEPRECATED?
define([
  'backbone',
  'underscore',
  'binary',
  'views/messenger_view'
], function(Backbone, _, Binary,MessengerView) {
  var BinaryClientView = Backbone.View.extend({
    
    initialize: function(options) {
      _.bindAll(this,'spawnStream');
      
      this.availableStreams = options.availableStreams;
      this.streams = {};
      this.client = new BinaryClient('ws://localhost:9000');
      this.client.on('open',this.spawnStream);
      
      this.dispatcher.on('spawnStream',this.spawnStream);
    },
    
    spawnStream: function(streamType) {
      if(typeof streamType === undefined) {
        this.streams["Messenger"] = new MessengerView({
          stream: this.client.createStream({type: "message"})
        });
        return;
      }
      
      if(typeof this.streams[streamType] !== undefined) {
        return false;
      }
      
      // this.streams[streamType] = new this.availableStreams[streamType+"StreamView"]({
      //   stream: this.client.
      // });
    
    }
  });
  
  return BinaryClientView;
});
