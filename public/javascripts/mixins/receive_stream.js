// More or less an abstract interface. Methods are left to the user to implement
define([], function() {
	var ReceiveStream = {
		this.parts = [],
		this.metadata = {},
		
		onData: function(data) {
			this.parts.push(data);
		},
		
		onEnd: function() {},
		onClose: function() {},
		onError: function() {}
	};
	
	return ReceiveStream;
});
