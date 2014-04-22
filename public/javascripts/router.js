define([
  'backbone',
  'underscore',
  'views/access_generator_view',
  'views/messenger_view',
  'views/hud_view',
  'views/queue_view',
  'views/tool_tip_view',
], function(Backbone, _, TokenGenerator, MessengerView, HudView,QueueView, ToolTipView) {
  var router = Backbone.Router.extend({
    routes: {
      '': 'index',
      'room/:guid': 'transmit'
    },

    initialize: function() {
      Backbone.history.start({pushState: true});
    },

    index: function() {
      console.log('mew')
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

