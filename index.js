import dotenv from 'dotenv';
dotenv.config();

import YTMusic from 'ytmusic-api';
import * as logger from 'log-update';

const ytmusic = new YTMusic();
await ytmusic.initialize();
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
		rotes: [
			{
				name: 'search',
				url: '/search',
				method: 'GET',
				description: 'Search for songs, albums, artists, and playlists',
				params: {
					query: 'String'
				}
			},
			
			{
				name: 'song',
				url: '/song',
				method: 'GET',
				description: 'Get song details',
				params: {
					id: 'String'
				}
			},
			{
				name: 'song lyrics',
				url: '/song/:id/lyrics',
				method: 'GET',
				description: 'Get song lyrics',
				params: {
					id: 'String'
				}
			},
			{
				name: 'song resource',
				url: '/song/:id/resource',
				method: 'GET',
				description: 'Get song resource',
				params: {
					id: 'String'
				}
			},
			{
				name: 'song download',
				url: '/song/:id/download',
				method: 'GET',
				description: 'Download song',
				params: {
					id: 'String'
				}
			},
			{
				name: 'song download audio',
				url: '/song/:id/download/audio',
				method: 'GET',
				description: 'Download song audio',
				params: {
					id: 'String'
				}
			},
			{
				name: 'song download video',
				url: '/song/:id/download/video',
				method: 'GET',
				description: 'Download song video',
				params: {
					id: 'String'
				}
			}
		]
	});
});

// API
import search from './routes/search.js';
app.use('/search', search(ytmusic));
import song from './routes/song.js';
app.use('/song', song(ytmusic));



// Start server
server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});