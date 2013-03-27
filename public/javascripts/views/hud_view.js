define([
	'backbone',
	'underscore',
	'views/client_hud_view',
	'views/transport_type_view'
], function(Backbone, _,ClientHudView,TransportTypeView,ReceiveView) {
	var HudView = Backbone.View.extend({
		el: "#stats",
		
		initialize: function() {
			this.clientHud = new ClientHudView();
			this.transportHud = new TransportTypeView();
		},
		
		render: function() {
			this.$el.prepend(this.transportHud.render().el);
			this.$el.prepend(this.clientHud.render().el);
			
			return this;
		}
	});
	
	return HudView;
});