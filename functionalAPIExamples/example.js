module.exports = function example(request, response, callback) {
	var self = this;
	
	self.properties = {
		responseMechanism: 'sendJSON',
		name: 'example',
		verb: 'post'
	};
	
	self.test = function test(params) {
		response.message.error = false;
        response.message.data = params.username;
		callback(response);
	};
	
	return self;
};
