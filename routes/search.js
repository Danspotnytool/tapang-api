
import express from 'express';

const search = express.Router();

/**
 * @type {(ytmusic: import('ytmusic-api').default, ytdl: import('@distube/ytdl-core'), agent: import('@distube/ytdl-core').Agent) => import('express').Router}
 */
export default (ytmusic, ytdl, agent) => {
	search.get('/:query', async (req, res) => {
		const query = req.params.query;
		if (!query) {
			return res.status(400).json({ error: 'Query is required' });
		};

		ytmusic.search(query).then((results) => {
			res.status(200).json(results);
		}).catch((error) => {
			res.status(500).json({
				error: error.message,
				variables: {
					query: query
				}
			});
		});
	});
	return search;
};