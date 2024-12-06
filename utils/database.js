
import admin from 'firebase-admin';
import * as serviceAccount from '../firebase service-account';

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: process.env.FIREBASE_DATABASE_URL
});

const users = admin.firestore().collection('users');