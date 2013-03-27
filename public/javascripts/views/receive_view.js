define([
	'backbone',
	'underscore',
	'text!templates/hud.html'
], function(Backbone, _, Hud) {
	var RecieveView = Backbone.View.extend({
		el: "#current",
		template: _.template(Hud),
			
		initialize: function() {
			_.bindAll(this, 'receiving');
			
			this.filename = null;
			this.dispatcher.on('receiving',this.receiving);
		},
		
		render: function() {
			this.$el.html(this.template({
				type: "currently receiving", 
				value: this.filename 
			}));
			return this;
		},
		
		receiving: function(filename) {
			this.filename = filename;
			this.render();
		}
	});
	
	return RecieveView;
});