define([
  'backbone',
  'underscore',
  'views/access_generator_view',
  'views/messenger_view',
  'views/hud_view',
  'views/queue_view',
  'views/tool_tip_view',
], function(Backbone, _, TokenGenerator, MessengerView, HudView, ToolTipView) {
  var router = Backbone.Router.extend({
    routes: {
      '': 'index',
      '/room/:guid': 'transmit'
    },

    index: function() {
      new TokenGenerator();
    },

    transmit: function(guid) {
      console.log(arguments);
      new MessengerView();
      new QueueView();
      new HudView().render().el;
      new ToolTipView().render().el;
    }
  });

  return router;
});

