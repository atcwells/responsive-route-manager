module.exports = function newAPItest(request, response, callback) {
	var self = this;
	
	self.properties = {
		responseMechanism: 'sendJSON',
		name: 'newAPItest',
		verb: 'post'
	};
	
	self.test = function test() {
		response.message.error = false;
		callback(response);
	};
	
	return self;
};