
import express from 'express';
import bcrypt from 'bcrypt';

import { users } from '../utils/database.js';

const router = express.Router();

/** 
 * Get all users
 * Parameters: null
 * Body: null
 * Response: UserObject[]
 */
router.get('/', async (req, res) => {
	const snapshot = await users.once('value');
	const data = snapshot.val();

	if (!data) {
		res.status(200).json([]);
		return;
	};

	for (const userId in data) {
		delete data[userId].password;
		delete data[userId].tokens
	};

	res.status(200).json(data);
});

/**
 * Get a user
 * Parameters: userId
 * Body: UserObject
 * Response: UserObject
 */
router.get('/:userId', async (req, res) => {
	const userId = req.params.userId;
	if (!userId) {
		res.status(400).json({ message: 'Missing required userId' });
		return;
	};
	const snapshot = await users.child(userId).once('value');
	const data = snapshot.val();

	if (!data) {
		res.status(404).json({ message: 'User not found' });
		return
	};

	delete data.password;
	delete data.tokens;
	res.status(200).json(data);
});

/**
 * Create a user
 * Parameters: null
 * Body: { username, email, password }
 * Response: UserObject
 */
router.post('/', async (req, res) => {
	const { username, email, password } = req.body;
	if (!username || !email || !password) {
		res.status(400).json({ message: 'Missing required username, email, or password' });
		return;
	};
	const hashedPassword = await bcrypt.hash(password, 10);
	const userId = users.push().key;
	const user = {
		userId,
		username,
		email,
		password: hashedPassword,
		tokens: []
	};
	await users.child(userId).set(user);
	delete user.password;
	delete user.tokens;
	res.status(201).json(user);
});

/**
 * Sign a user
 * Parameters: null
 * Body: { email | username, password }
 * Response: UserAuthenticationObject
 */
router.post('/sign', async (req, res) => {
	const { emailOrUsername, password } = req.body;
	if (!emailOrUsername || !password) {
		res.status(400).json({ message: 'Missing required email or username, or password' });
		return;
	};
	
	const snapshot = await users.once('value');
	const data = snapshot.val();
	const user = Object.values(data).find(user => user.email === emailOrUsername || user.username === emailOrUsername);
	if (!user) {
		res.status(404).json({ message: 'User not found' });
		return;
	};

	const isPasswordCorrect = await bcrypt.compare(password, user.password);
	if (!isPasswordCorrect) {
		res.status(401).json({ message: 'Incorrect password' });
		return;
	};

	delete user.password;
	
	const token = `${btoa(user.userId)}-${btoa(new Date().getTime())}`;
	const tokens = user.tokens || [];
	tokens.push(token);
	user.tokens = tokens;
	await users.child(user.userId).update(user);

	res.status(200).json({
		token: token,
		userId: user.userId,
	});
});

/**
 * Unsign a user
 * Parameters: null
 * Body: { userId, token }
 * Response: null
 */
router.delete('/sign', async (req, res) => {
	const { userId, token } = req.body;
	if (!userId || !token) {
		res.status(400).json({ message: 'Missing required userId or token' });
		return;
	};

	const snapshot = await users.child(userId).once('value');
	const user = snapshot.val();
	if (!user) {
		res.status(404).json({ message: 'User not found' });
		return;
	};

	const tokens = user.tokens || [];
	const index = tokens.indexOf(token);
	if (index === -1) {
		res.status(404).json({ message: 'Token not found' });
		return;
	};

	tokens.splice(index, 1);
	user.tokens = tokens;
	await users.child(userId).update(user);

	res.status(200).json();
});

export default router;