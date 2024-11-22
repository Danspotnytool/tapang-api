
import express from 'express';

const search = express.Router();

/**
 * @type {(ytmusic: import('ytmusic-api').default) => import('express').Router}
 */
export default (ytmusic) => {
	search.get(['/', '/:query'], async (req, res) => {
		const query = req.params.query || req.query.query;
		if (!query) {
			return res.status(400).json({ error: 'Query is required' });
		};
		const searchResults = await ytmusic.search(query);
		res.status(200).json(searchResults);
	});
	return search;
};