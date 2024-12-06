import dotenv from 'dotenv';
dotenv.config();

import admin from 'firebase-admin';
import serviceAccount from '../firebase service-account.js';

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: process.env.FIREBASE_DATABASE_URL
});

/**
 * @typedef {{
 * 		userId: String,
 * 		username: String,
 * 		email: String,
 * 		password?: String,
 * 		tokens?: String[]
 * }} UserObject
 */

/**
 * @typedef {{
 * 		token: String,
 * 		user: UserObject
 * }} UserAuthenticationObject
 */

const users = admin.database().ref('users');

export { users };