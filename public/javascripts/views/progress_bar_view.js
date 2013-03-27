define([
	'backbone',
	'underscore',
	'text!templates/progress_bar.html'
], function(Backbone,_,Progress) {
	var ProgressBar = Backbone.View.extend({
		className: "progress span4",
		template: _.template(Progress),
		
		initialize: function() {
			_.bindAll(this,'changeLevel')
			this.level = 0;
			console.log('init')
			this.dispatcher.on('updateProgress',this.changeLevel);
			this.dispatcher.on('transmissionEnd',this.forceProgress);
		},
		
		render: function() {
			this.$el.html(this.template({level: this.level}));
			return this;
		},
		
		changeLevel: function(data) {
			this.level = Math.round(this.level + data * 100,1);
			this.render();
		},
		
		forceProgress: function() {
			if(this.level >= 100) return false;
			
			this.level = 100;
			this.render();
		}
	});
	
	return ProgressBar;
});