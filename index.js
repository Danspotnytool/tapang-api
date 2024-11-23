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

	const log = logger.createLogUpdate(process.stdout);
	const url = req.url;
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
app.use('/search', search(ytmusic));
import song from './routes/song.js';
app.use('/song', song(ytmusic));



// Start server
server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});