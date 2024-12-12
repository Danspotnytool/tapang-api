import dotenv from 'dotenv';
dotenv.config();

import requestIp from 'request-ip';
import * as logger from 'log-update';

import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import { WebSocketServer } from 'ws';

// Constants
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server: server });
const PORT = process.env.PORT || 5000;


// Middlewares
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestIp.mw());
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', '*');
	res.header('Access-Control-Allow-Method', '*');

	const url = req.url;
	const log = logger.createLogUpdate(process.stdout);
	log(`[${new Date().toLocaleString()}] ${req.method} ${url}`);
	next();
	res.on('finish', () => {
		log(`[${new Date().toLocaleString()}] ${req.method} ${url} - ${res.statusCode} ${res.statusMessage}`);
	});
});



// Routes
import usersRouter from './routes/users.js';
app.use('/users', usersRouter);
import monitorsRouter from './routes/monitors.js';
app.use('/monitors', monitorsRouter);

app.get('/', (req, res) => {
	res.status(200).json({
		message: 'Hello! From Tapang API',
		rotes: {
			users: usersRouter.stack.map((layer) => {
				return {
					method: layer.route.stack[0].method,
					path: layer.route.path
				};
			})
		}
	});
});



// Start server
server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});

wss.on('connection', async (ws, req) => {
});