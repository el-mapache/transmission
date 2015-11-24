define([
  'backbone',
  'underscore',
  'text!templates/hud.html'
], function(Backbone, _, Hud) {
  // Updates the number of connected clients
  var ClientHudView = Backbone.View.extend({
    el: "#subscribers",

    template: _.template(Hud),

    initialize: function() {
      _.bindAll(this, 'changeClientCount');
      this.dispatcher.on('changeClientCount', this.changeClientCount);
    },

    render: function() {
      this.$el.html(this.template({
        type: "clients subscribing",
        value: this.clientCount
      }));
      return this;
    },

    // Since I dont have a central view to hold globals, we just call the global clientCount directly
    changeClientCount: function(clientCount) {
      Backbone.View.prototype.clientCount = clientCount
      this.render();
    }
  });

  return ClientHudView;
});
