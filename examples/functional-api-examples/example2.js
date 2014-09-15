module.exports = function example2(request, response, callback) {
	var self = this;

	self.properties = {
		responseMechanism: 'sendJSON',
		name: 'example2',
		verb: 'post'
	};

	self.test = function test() {
		response.message.error = false;
    response.message.data = 'params222.username22';
		callback();
	};

	return self;
};
