define([
  'backbone',
  'underscore',
  'views/token_generator_view',
  'views/messenger_view',
  'views/hud_view',
  'views/queue_view',
  'views/tool_tip_view',
], function(Backbone, _, TokenGeneratorView, MessengerView, HudView, QueueView, ToolTipView) {
  var router = Backbone.Router.extend({
    
    routes: {
      '': 'index',
      'room/:guid': 'transmit'
    },

    initialize: function() {
      Backbone.history.start({pushState: true});
    },

    index: function() {
      new TokenGeneratorView();
    },

    transmit: function(guid) {
      new MessengerView();
      new QueueView();
      new HudView().render().el;
      new ToolTipView().render().el;
    }
  });

  return router;
});

