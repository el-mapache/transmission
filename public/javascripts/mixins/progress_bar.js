// Level meter mixin.  Views define their own progress bar elements
define([],function() {

	var ProgressBar = {
		progressBar: null,
		level: 0,

		updateProgress: function() {
			console.log('level', this.level)

			this.progressBar.html(this.level + '%');
			this.progressBar.css({width: this.level+'%'});
		},

		finishProgress: function() {
			console.log('all done');
			this.level = 100;
			this.updateProgress();
		}
	};
	return ProgressBar;
});
