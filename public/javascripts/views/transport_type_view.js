define([
  'backbone',
  'underscore',
  'text!templates/hud.html'
], function(Backbone, _, Hud) {

  /* Simple view to change the current transmission type.
   * Responds to incoming streams
   *
   * Default: '-'
   * Transmission: 'TX'
   * Receive: 'RX'
   *
   */
  var TransportTypeView = Backbone.View.extend({
    el: "#mode",
    
    template: _.template(Hud),
    
    initialize: function() {
      _.bindAll(this,'changeMode');
      
      this.mode = '-';
      this.dispatcher.on('changeMode',this.changeMode);
    },
    
    render: function() {
      this.$el.html(this.template({type: "mode", value: this.mode}));
      return this;
    },
    
    changeMode: function(value) {
      this.mode = value;
      return this.render();
    }
  });
  
  return TransportTypeView;
});
