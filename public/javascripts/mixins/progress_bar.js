// Level meter mixin.  Views define their own progress bar elements
define([],function() {
	
	var ProgressBar = {
		progressBar: null,
		level: 0,
	
		updateProgress: function() {
			this.progressBar.html(this.level + '%');
			this.progressBar.css({width: this.level+'%'});
		},
	
		finishProgress: function() {
			this.level = 100;
			this.updateProgress();
		}
	};
	return ProgressBar;
});
