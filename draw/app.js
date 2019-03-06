#!/usr/bin/env node

const WebSocket = require('ws');
const redis = require('redis');
var validatePath = require('./validate').validatePath;

const wss = new WebSocket.Server({ port: process.env.WS_PORT || 43471 });

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

console.log('Init Redis connection on %s:%s', REDIS_HOST, REDIS_PORT);
var redisClient = redis.createClient(process.env.REDIS_PORT || 6379, process.env.REDIS_HOST || '127.0.0.1');
var redisSubscriber = redisClient.duplicate();

redisClient.on('connect', function() {
	console.log('Redis connected');
});

function broadcastPath(pathStr) {
	var path = JSON.parse(pathStr);
	wss.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			if (client._socket.remoteAddress != path.ip ||
				client._socket.remotePort != path.port) { // don't send message to its submitter
				client.send('[' + pathStr + ']');
			}
		}
	});
};

redisSubscriber.on('connect', function() {
	redisSubscriber.subscribe('path');
});

redisSubscriber.on('message', function(channel, msg) {
	broadcastPath(msg);
});

wss.on('connection', function (ws) {
	var address = ws._socket.remoteAddress + ':' + ws._socket.remotePort;
	console.log('Client connected %s', address);

	redisClient.lrange('paths', 0, -1, function(err, paths) {
		if (err) {
			console.error('Error getting data from Redis', err);
			return;
		}
		ws.send('[' + paths.join(',') + ']');
	});

	ws.on('message', function (msg) {
		var path = JSON.parse(msg);
		var stamp = new Date();
		console.log('Received from %s', address);
		if (!validatePath(path)) {
			console.error('Invalid message from %s', address);
			return;
		}
		var path = {
			ip: ws._socket.remoteAddress,
			port: ws._socket.remotePort,
			stamp: stamp.toISOString(),
			points: path.points
		}
		redisClient.rpush('paths', JSON.stringify(path)); // save path
		redisClient.publish('path', JSON.stringify(path)); // notify other clients
	});

	ws.on('close', function() {
		console.log('Client disconnected %s', address);
	});
});
