
import express from 'express';

const router = express.Router();

/**
 * @type {{
 * 		id: String,
 * 		temperature: Number,
 * 		humidity: Number
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
		humidity: 0
	};

	monitors.push(monitor);
	res.status(201).json(monitor);
});

/**
 * Update a monitor
 * Parameters: monitorId
 * Body: { temperature, humidity }
 * Response: MonitorObject
 */
router.patch('/:monitorId', async (req, res) => {
	const monitorId = req.params.monitorId;
	const monitor = monitors.find((monitor) => monitor.id === monitorId);

	if (!monitor) {
		res.status(404).json({ message: 'Monitor not found' });
		return;
	};

	const { temperature, humidity } = req.body;
	monitor.temperature = temperature;
	monitor.humidity = humidity;

	res.status(200).json(monitor);
});

export default router;