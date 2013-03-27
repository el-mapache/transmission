// TODO MIGHT BE DEPRECATED
define([
  'backbone',
  'underscore',
  'text!templates/file_info.html'
], function(Backbone, _, FileInfo) {
  var DropBoxView = Backbone.View.extend({
    el: "#tx-drop-box",
    template: _.template(FileInfo),
    
    events: {
      'dragenter': '_doNothing',
      'dragover': '_doNothing',
      'drop': 'handleDrop'
    },
    
    initialize: function() {
      this.queue = [];
      this.file = null;
    },
    
    render: function() {
      return this;
    },
    
    handleDrop: function(evt) {
      evt.preventDefault();
      
      this.file = evt.dataTransfer.files[0];
      if(this.clientCount === 0) {
        this.dispatcher.trigger('showTooltip','noClients');
      }
    },
    
    _doNothing: function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
   });
  
  return DropBoxView;
});
