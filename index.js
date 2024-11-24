import dotenv from 'dotenv';
dotenv.config();

import YTMusic from 'ytmusic-api';
import * as logger from 'log-update';
import ytdl from '@distube/ytdl-core';

const cookie = JSON.parse(process.env.YT_COOKIES.replaceAll('\'', '"'));
const ytmusic = new YTMusic();
await ytmusic.initialize({
	cookies: cookie.map((cookie) => {
		return `${cookie.name}=${cookie.value}`;
	}).join('; ')
});
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';

// Constants
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 5000;

// Websocket
wss.on('connection', async (ws) => {
	ws.on('message', async (message) => {
		console.log('Received message:', message);
	});
});



// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

	req.localAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	const url = req.url;

	const log = logger.createLogUpdate(process.stdout);

	log(`[${new Date().toLocaleString()}] ${req.method} ${url}`);

	next();

	res.on('finish', () => {
		log(`[${new Date().toLocaleString()}] ${req.method} ${url} - ${res.statusCode} ${res.statusMessage}`);
	});
});



// Routes
app.get('/', (req, res) => {
	res.status(200).json({
		message: 'Hello! From Tapang API',
		sample: {
			search: '/search/:query',
			song: '/song/:id',
			lyrics: '/song/:id/lyrics',
			resource: '/song/:id/resource',
			download: '/song/:id/download',
			audio: '/song/:id/download/audio',
			video: '/song/:id/download/video'
		}
	});
});

// API
import search from './routes/search.js';
app.use('/search', search(ytmusic, ytdl));
import song from './routes/song.js';
app.use('/song', song(ytmusic, ytdl));



// Start server
server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});