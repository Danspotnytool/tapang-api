import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import axios from 'axios';
import yts from 'yt-search';
import ytdl from '@distube/ytdl-core';

const song = express.Router();

const cookies = JSON.parse(process.env.YOUTUBE_COOKIES.replaceAll('\'', '"') || '[]');

/**
 * @type {(ytmusic: import('ytmusic-api').default) => import('express').Router}
 */
export default (ytmusic) => {
	song.get('/:id', async (req, res) => {
		const id = req.params.id;
		if (!id) {
			return res.status(400).json({ error: 'ID is required' });
		};

		yts({
			videoId: id,
			userAgent: req
		}).then((result) => {
			res.status(200).json(result);
		}).catch((error) => {
			res.status(500).json({
				error: error.message,
				variables: {
					id: id
				}
			});
		});
	});

	song.get('/:id/lyrics/', async (req, res) => {
		const id = req.params.id;
		if (!id) {
			return res.status(400).json({ error: 'ID is required' });
		};
		ytmusic.getLyrics(id).then((lyrics) => {
			res.status(200).json(lyrics);
		}).catch((error) => {
			res.status(500).json({
				error: error.message,
				variables: {
					id: id
				}
			});
		});
	});



	/**
	 * @typedef {{
	 *    resourceId: String,
	 *    urls: {
	 *            url: String,
	 *            name: 'MP3' | 'MP4',
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

		axios({
			url: 'https://youtube-quick-video-downloader.p.rapidapi.com/api/youtube/links',
			method: 'POST',
			headers: {
				'x-rapidapi-host': 'youtube-quick-video-downloader.p.rapidapi.com',
				'x-rapidapi-key': '1003c07223msh07af8432abe6d7fp135876jsn34d096ee567f'
			},
			data: {
				url: `https://www.youtube.com/watch?v=${id}`
			}
		}).then((response) => {
			res.status(200).json(response.data);
		}).catch((error) => {
			res.status(500).json({
				error: error.message,
				variables: {
					id: id
				}
			});
		});
	});



	// Stream
	song.get('/:id/stream/', async (req, res) => {
		const id = req.params.id;
		if (!id) {
			return res.status(400).json({ error: 'ID is required' });
		};

		const response = await axios({
			url: 'https://youtube-quick-video-downloader.p.rapidapi.com/api/youtube/links',
			method: 'POST',
			headers: {
				'x-rapidapi-host': 'youtube-quick-video-downloader.p.rapidapi.com',
				'x-rapidapi-key': '1003c07223msh07af8432abe6d7fp135876jsn34d096ee567f'
			},
			data: {
				url: `https://www.youtube.com/watch?v=${id}`
			}
		});

		/** @type {Resource} */
		const resources = response.data;

		const highestQualityResource = resources.reduce((prev, curr) => {
			if (curr.urls.qualityNumber > prev.urls.qualityNumber) {
				return curr;
			};
			return prev;
		});
		const highestQualityAudio = highestQualityResource.urls.reduce((prev, curr) => {
			if (curr.audio) {
				if (curr.qualityNumber > prev.qualityNumber) {
					return curr;
				};
			};
			return prev;
		});

		const stream = axios({
			url: highestQualityAudio.url,
			method: 'GET',
			headers: {
				'x-rapidapi-host': 'youtube-quick-video-downloader.p.rapidapi.com',
				'x-rapidapi-key': '1003c07223msh07af8432abe6d7fp135876jsn34d096ee567f'
			},
			responseType: 'stream'
		});

		stream.then((response) => {
			// Set headers
			res.setHeader('Content-Type', 'audio/mpeg');
			res.setHeader('Content-Disposition', `attachment; filename="${highestQualityResource.meta.title}.mp3"`);
			response.data.pipe(res);
		}).catch((error) => {
			res.status(500).json({
				error: error.message,
				variables: {
					id: id
				}
			});
		});
	});
	return song;
};