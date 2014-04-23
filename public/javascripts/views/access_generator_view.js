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
      uid.save({}, {
        success: this._onSaveSuccess,
        error: this._onSaveError
      });
    },

    _onSaveSuccess: function(model, res, xhr) {
      location.href = location.href + 'room/' + res.code;
    },

    _onSaveError: function(mode, res, xhr) {
      var error = JSON.parse(res.responseText).error
    }
  });

  return AccessGeneratorView;
});

