import dotenv from 'dotenv';
dotenv.config();

import requestIp from 'request-ip';

import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';

import { users } from './utils/database.js';

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
app.use(requestIp.mw());
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

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
		rotes: []
	});
});



// Start server
server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});