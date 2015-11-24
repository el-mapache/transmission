define([
	'backbone',
	'underscore'
], function(Backbone, _) {
  var guid = Backbone.Model.extend({
    urlRoot: 'guid'
  });

  return guid;
});
