define([
  'backbone',
  'underscore',
  'models/guid',
  'text!templates/generate.html'
], function(Backbone, _, GUID, GenerateTmpl) {
  var AccessGeneratorView = Backbone.View.extend({
    el: "#grant-access",

    template: _.template(GenerateTmpl),

    events: {
      "click button": "generateUniqueURL"
    },

    initialize: function() {
      _.bindAll(this, 'generateUniqueURL');
      this.render();
    },

    render: function() {
      this.$el.html(this.template());

      return this;
    },

    generateUniqueURL: function() {
      var uid = new GUID();
      uid.save();
//      location.href = location.href + 'room/' + uid.get('accessCode');
    }

  });

  return AccessGeneratorView;
});

