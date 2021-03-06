/** @fileOverview
	Wires up node messaging event handlers to a {@link NodeState} object.
*/

var formatter = require('./nodeMessageFormatter.js');
var mapper = require('./uriToNodeTypeMapper.js');
var constants = require('./constants.js');
var publisher = require('./nodeMessagePublisher.js');
var util = require('util');

/** @namespace */
module.exports = {

	/**
		Configures the event handlers used for node message publishing
		@param {NodeState} node The node whose events are to be handled
	*/
	configure: function(node) {
		node.on('change', function() {
			var links = node.outgoingLinks;
			if (links.length > 0) {
				console.log('%s sending state change notification to %d link(s)', node.uri, links.length);
			}
			
			for (var i = 0; i < links.length; i++) {
				var type = mapper.getNodeType(links[i].linkUri);
				var msg = formatter.format(node, constants.URI_NOTIF_STATE_CHANGE, links[i].linkUri, type);
				publisher.publish(msg.toType, msg);
			}
		});
		
		node.on('linkRequest', function(fromUri, toUri, direction) {
			var type = mapper.getNodeType(toUri);
			var msg = formatter.format(node, constants.URI_NOTIF_LINK_REQUEST, toUri, type, {linkDirection: direction});
			publisher.publish(msg.toType, msg);
		});

		node.on('linkRequestAck', function(toUri, direction, ack) {
			var type = mapper.getNodeType(toUri);
			var msg = formatter.format(node, constants.URI_NOTIF_LINK_REQUEST_ACK, toUri, type, {linkDirection: direction, ack: ack});
			publisher.publish(msg.toType, msg);
		});
		
		node.on('linkRemove', function(fromUri, toUri, direction) {
			var type = mapper.getNodeType(toUri);
			var msg = formatter.format(node, constants.URI_NOTIF_LINK_REMOVE, toUri, type, {linkDirection: direction});
			publisher.publish(msg.toType, msg);
		});		
	}
}
