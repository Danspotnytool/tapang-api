
import express from 'express';

const router = express.Router();

/**
 * @type {{
 * 		id: String,
 * 		temperature: Number,
 * 		code?: String,
 * 		history?: {
 * 			temperature: Number,
 * 			date: Date
 * 		}[],
 * 		decreasing?: Boolean,
 * 		increasing?: Boolean,
 * 		normal?: Boolean,
 * 		connected?: Boolean
 * }[]}
 */
const monitors = [];

/**
 * Get all monitors
 * Parameters: null
 * Body: null
 * Response: MonitorObject[]
 */
router.get('/', async (req, res) => {
	res.status(200).json(monitors);
});

/**
 * Get a monitor
 * Parameters: monitorId
 * Body: MonitorObject
 * Response: MonitorObject
 */
router.get('/:monitorId', async (req, res) => {
	const monitorId = req.params.monitorId;
	if (!monitorId) {
		res.status(400).json({ message: 'Missing required monitorId' });
		return;
	};

	const monitor = monitors.find((monitor) => monitor.id === monitorId);

	if (!monitor) {
		res.status(404).json({ message: 'Monitor not found' });
		return;
	};

	res.status(200).json(monitor);
});

/**
 * Create a monitor
 * Parameters: null
 * Body: Null
 * Response: MonitorObject
 */
router.post('/', async (req, res) => {
	const monitor = {
		id: Date.now().toString(),
		temperature: 0,
		history: [],
		decreasing: false,
		increasing: false,
		normal: true,
		connected: false
	};

	monitors.push(monitor);
	res.status(201).json(monitor);
});

/**
 * Request for code
 * Parameters: null
 * Body: Null
 * Response: MonitorObject
 */
router.post('/code/:monitorId', async (req, res) => {
	const monitorId = req.params.monitorId;
	if (!monitorId) {
		res.status(400).json({ message: 'Missing required monitorId' });
		return;
	};

	const monitor = monitors.find((monitor) => monitor.id === monitorId);

	if (!monitor) {
		res.status(404).json({ message: 'Monitor not found' });
		return;
	};

	const code = Math.random().toString(36).substring(2, 5) + ' ' + Math.random().toString(36).substring(2, 5);
	monitor.code = code;
	res.status(200).json(monitor);
});

/**
 * Update a monitor
 * Parameters: monitorId
 * Body: MonitorObject
 * Response: MonitorObject
 */
router.post('/:monitorId/temperature', async (req, res) => {
	const monitorId = req.params.monitorId;
	if (!monitorId) {
		res.status(400).json({ message: 'Missing required monitorId' });
		return;
	};

	const monitor = monitors.find((monitor) => monitor.id === monitorId);
	if (!monitor) {
		res.status(404).json({ message: 'Monitor not found' });
		return;
	};
	if (monitor.history.length >= 50) {
		monitor.history.shift();
	};
	monitor.history.push({
		temperature: monitor.temperature,
		date: new Date()
	});

	// Analyze history
	const history = monitor.history;
	let sum = 0;
	for (const record of history) {
		sum += record.temperature;
	};
	const average = sum / history.length;
	const last = history[history.length - 1].temperature;
	if (last > average) {
		monitor.increasing = true;
		monitor.decreasing = false;
		monitor.normal = false;
	} else if (last < average) {
		monitor.decreasing = true;
		monitor.increasing = false;
		monitor.normal = false;
	} else {
		monitor.normal = true;
		monitor.increasing = false;
		monitor.decreasing = false;
	};

	const { temperature } = req.body;
	if (temperature) {
		monitor.temperature = temperature;
	};

	res.status(200).json(monitor);
});

/**
 * Get a monitor
 * Parameters: code
 * Body: MonitorObject
 * Response: MonitorObject
 */
router.get('/code/:code', async (req, res) => {
	const code = req.params.code;
	if (!code) {
		res.status(400).json({ message: 'Missing required code' });
		return;
	};

	const monitor = monitors.find((monitor) => monitor.code === code);

	if (!monitor) {
		res.status(404).json({ message: 'Monitor not found' });
		return;
	};

	monitor.connected = true;

	res.status(200).json(monitor);
});

export default router;
export { monitors };