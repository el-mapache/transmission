define([
  'backbone',
  'underscore',
  'views/send_stream_view',
  'text!templates/file_info.html'
], function(Backbone, _, SendStreamView, FileInfo) {
  var FileView = Backbone.View.extend({
    template: _.template(FileInfo),
    
    // this.model refers to the file being transmitted/received
    initialize: function(options) {
      _.bindAll(this,'update','finish');

      this.dispatcher.on('transmissionProgress',this.update,this);
      this.dispatcher.on('transmissionEnd',this.finish,this);
      this.type = options.type; //up -> send, down -> receive
    },
    
    render: function() {
      this.$el.html(this.template({model: this.model.toJSON(), type: this.type}));
      this.progressBar = this.$el.find('.progress .bar');
      
      return this;
    },
    
    // Update the progress bar as files are transmitted. Occasionally, we will
    // go slightly past 100%, this function forces the bar to stop there
    update: function(data) {
      console.log(data);
      if(this.level < 100) this.level += data;
      if(this.level >= 100) this.level = 100
      this.updateProgress();
    },
    
    // Forces the progress bar to 100% to correct rounding errors
    finish: function() {
      if(this.level < 100) this.finishProgress();
      this.$el.find('.tx-success').addClass("icon-ok");
    },
    
    close: function() {
      this.unbind();
      this.dispatcher.off(null,null,this)
      this.dispatcher.off("transmissionProgress",this.update,this);
      this.dispatcher.off("transmissionEnd",this.finish,this);
    }
   });

  return FileView;
});
