define([
	'backbone',
	'underscore'
], function(Backbone, _) {
	var File = Backbone.Model.extend({
	  initialize: function(file) {
			this.set('formattedSize', this._formatSize(this.get('size')));
			this.set('file',file);
		},
    
    // from plupload source 
		_formatSize: function(size) {
	      if (size === "undefined" || /\D/.test(size)) {
	        return 'n/a';
	      }

	      if (size > 1073741824) {
	        return Math.round(size / 1073741824) + " gb";
	      }   

	      if (size > 1048576) {
	        return Math.round(size / 1048576) + " mb";
	      }   

	      if (size > 1024) {
	        return Math.round(size / 1024) + " kb";
	      }   

	      return size + " b";
	    }
		
	});

	return File;
});
