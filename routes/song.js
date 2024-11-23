
import express from 'express';
import phin from 'phin';

const song = express.Router();

/**
 * @type {(ytmusic: import('ytmusic-api').default) => import('express').Router}
 */
export default (ytmusic) => {
	song.get('/:id', async (req, res) => {
		const id = req.params.id;
		if (!id) {
			return res.status(400).json({ error: 'ID is required' });
		};
		ytmusic.getSong(id).then((song) => {
			res.status(200).json(song);
		}).catch((error) => {
			res.status(500).json({ error: error.message });
		});
	});

	song.get('/:id/lyrics/', async (req, res) => {
		const id = req.params.id;
		if (!id) {
			return res.status(400).json({ error: 'ID is required' });
		};
		const lyrics = await ytmusic.getLyrics(id);
		res.status(200).json(lyrics);
	});



	/**
	 * @typedef {{
	 *    resourceId: String,
	 *    urls: {
	 *            url: String,
	 *            name: 'MP3' | 'MP4'',
	 *            subName: '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p' | '144p' | '240p',
	 *            extension: 'mp3' | 'mp4',
	 *            quality: '360' | '480' | '720' | '1080' | '1440' | '2160' | '144' | '240',
	 *            qualityNumber: 360 | 480 | 720 | 1080 | 1440 | 2160 | 144 | 240,
	 *            audio: false,
	 *            itag: String,
	 *            videoCodec: 'avc1' | 'vp9',
	 *            audioCodec: 'mp4a' | 'opus',
	 *            isBundle: Boolean
	 *    }[],
	 *    meta: {
	 *        title: String,
	 *        sourceUrl: String,
	 *        duration: String,
	 *        tags: String,
	 *    },
	 *    pictureUrl: String,
	 *    videoQuality: String[],
	 *    service: String,
	 * }[]} Resource
	 */

	song.get('/:id/resource/', async (req, res) => {
		const id = req.params.id;
		if (!id) {
			return res.status(400).json({ error: 'ID is required' });
		};

		/**
		 * @type {phin.IJSONResponse<Resource>}
		 */
		const response = await phin({
			url: 'https://youtube-quick-video-downloader.p.rapidapi.com/api/youtube/links',
			method: 'POST',
			headers: {
				'x-rapidapi-host': 'youtube-quick-video-downloader.p.rapidapi.com',
				'x-rapidapi-key': '1003c07223msh07af8432abe6d7fp135876jsn34d096ee567f'
			},
			data: {
				url: `https://www.youtube.com/watch?v=${id}`
			},
			parse: 'json'
		});
		res.status(200).json(response.body);
	});

	song.get('/:id/download/', async (req, res) => {
		const id = req.params.id;
		if (!id) {
			return res.status(400).json({ error: 'ID is required' });
		};

		/**
		 * @type {phin.IJSONResponse<Resource>}
		 */
		const response = await phin({
			url: 'https://youtube-quick-video-downloader.p.rapidapi.com/api/youtube/links',
			method: 'POST',
			headers: {
				'x-rapidapi-host': 'youtube-quick-video-downloader.p.rapidapi.com',
				'x-rapidapi-key': '1003c07223msh07af8432abe6d7fp135876jsn34d096ee567f'
			},
			data: {
				url: `https://www.youtube.com/watch?v=${id}`
			},
			parse: 'json'
		});

		// Find the url with highest quality
		const resources = response.body;
		const highestQualityResource = resources.reduce((prev, curr) => {
			if (curr.urls.qualityNumber > prev.urls.qualityNumber) {
				return curr;
			};
			return prev;
		});
		const highestQualityUrl = highestQualityResource.urls.reduce((prev, curr) => {
			if (curr.audio) {
				if (curr.qualityNumber > prev.qualityNumber) {
					return curr;
				};
			};
			return prev;
		});
		if (!highestQualityUrl) {
			return res.status(404).json({ error: 'No audio found' });
		};

		res.status(200).json(highestQualityUrl);
	});

	song.get('/:id/download/audio/', async (req, res) => {
		const id = req.params.id;
		if (!id) {
			return res.status(400).json({ error: 'ID is required' });
		};

		/**
		 * @type {phin.IJSONResponse<Resource>}
		 */
		const response = await phin({
			url: 'https://youtube-quick-video-downloader.p.rapidapi.com/api/youtube/links',
			method: 'POST',
			headers: {
				'x-rapidapi-host': 'youtube-quick-video-downloader.p.rapidapi.com',
				'x-rapidapi-key': '1003c07223msh07af8432abe6d7fp135876jsn34d096ee567f'
			},
			data: {
				url: `https://www.youtube.com/watch?v=${id}`
			},
			parse: 'json'
		});

		// Find the url with highest quality
		const resources = response.body;
		const highestQualityResource = resources.reduce((prev, curr) => {
			if (curr.urls.qualityNumber > prev.urls.qualityNumber) {
				return curr;
			};
			return prev;
		});
		const highestQualityUrl = highestQualityResource.urls.reduce((prev, curr) => {
			if (curr.audio) {
				if (curr.qualityNumber > prev.qualityNumber) {
					return curr;
				};
			};
			return prev;
		});
		if (!highestQualityUrl) {
			return res.status(404).json({ error: 'No audio found' });
		};

		res.status(200).redirect(highestQualityUrl.url);
	});

	song.get('/:id/download/video/', async (req, res) => {
		const id = req.params.id;
		if (!id) {
			return res.status(400).json({ error: 'ID is required' });
		};

		/**
		 * @type {phin.IJSONResponse<Resource>}
		 */
		const response = await phin({
			url: 'https://youtube-quick-video-downloader.p.rapidapi.com/api/youtube/links',
			method: 'POST',
			headers: {
				'x-rapidapi-host': 'youtube-quick-video-downloader.p.rapidapi.com',
				'x-rapidapi-key': '1003c07223msh07af8432abe6d7fp135876jsn34d096ee567f'
			},
			data: {
				url: `https://www.youtube.com/watch?v=${id}`
			},
			parse: 'json'
		});

		// Find the url with highest quality
		const resources = response.body;
		const highestQualityResource = resources.reduce((prev, curr) => {
			if (curr.urls.qualityNumber > prev.urls.qualityNumber) {
				return curr;
			};
			return prev;
		});
		const highestQualityUrl = highestQualityResource.urls.reduce((prev, curr) => {
			if (!curr.audio) {
				if (curr.qualityNumber > prev.qualityNumber) {
					return curr;
				};
			};
			return prev;
		});
		if (!highestQualityUrl) {
			return res.status(404).json({ error: 'No video found' });
		};

		res.status(200).redirect(highestQualityUrl.url);
	});

	return song;
};