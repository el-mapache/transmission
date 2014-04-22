define([
	'backbone',
	'underscore'
], function(Backbone, _) {
  var guid = Backbone.Model.extend({
    urlRoot: '/guid',
    defaults: {
      accessCode: null
    },

    initialize: function() {
      this.set('accessCode', this._guid());
    },

    _guid: function() {
      function s4() {
        var num = (1 + Math.random() * 65536) | 0;
        return num.toString(16).substring(1);
      }

      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
  });

  return guid;
});

