
import express from 'express';

const search = express.Router();

/**
 * @type {(ytmusic: import('ytmusic-api').default) => import('express').Router}
 */
export default (ytmusic) => {
	search.get('/:query', async (req, res) => {
		const query = req.params.query;
		if (!query) {
			return res.status(400).json({ error: 'Query is required' });
		};
		const search = await ytmusic.search(query);
		res.status(200).json(search);
	});
	return search;
};