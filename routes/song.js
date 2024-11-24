
import express from 'express';
import axios from 'axios';
import yts from 'yt-search';
import ytdl from '@distube/ytdl-core';

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

		yts({ videoId: id }).then((result) => {
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



	// Download
	song.get('/:id/download/', async (req, res) => {
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
			// Find the url with highest quality
			/**
			 * @type {Resource}
			 */
			const resources = response.data;
			const highestQualityResource = resources.reduce((prev, curr) => {
				if (curr.urls.qualityNumber > prev.urls.qualityNumber) {
					return curr;
				};
				return prev;
			});
			const highestQualityAudioUrl = highestQualityResource.urls.reduce((prev, curr) => {
				if (curr.audio) {
					if (curr.qualityNumber > prev.qualityNumber) {
						return curr;
					};
				};
				return prev;
			});
			const highestQualityVideoUrl = highestQualityResource.urls.reduce((prev, curr) => {
				if (!curr.audio) {
					if (curr.qualityNumber > prev.qualityNumber) {
						return curr;
					};
				};
				return prev;
			});

			res.status(200).json({
				audio: highestQualityAudioUrl,
				video: highestQualityVideoUrl
			});
		}).catch((error) => {
			res.status(500).json({
				error: error.message,
				variables: {
					id: id
				}
			});
		});
	});
	song.get('/:id/download/audio/', async (req, res) => {
		const id = req.params.id;
		if (!id) {
			return res.status(400).json({ error: 'ID is required' });
		};
		
		ytdl.getInfo(id).then((info) => {
			const audio = info.formats.find((format) => format.hasAudio && !format.hasVideo);
			if (!audio) {
				return res.status(404).json({ error: 'No audio found' });
			};
			res.setHeader('Content-Disposition', `attachment; filename="${info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_')}.${audio.container}"`);
			res.setHeader('Content-Type', `audio/${audio.container}`);
			axios({
				url: audio.url,
				method: 'GET',
				responseType: 'stream'
			}).then((response) => {
				response.data.pipe(res);
			}).catch((error) => {
				res.status(500).json({
					error: error.message,
					variables: {
						id: id
					}
				});
			});
		}).catch((error) => {
			res.status(500).json({
				error: error.message,
				variables: {
					id: id
				}
			});
		});
	});
	song.get('/:id/download/video/', async (req, res) => {
		const id = req.params.id;
		if (!id) {
			return res.status(400).json({ error: 'ID is required' });
		};

		ytdl.getInfo(id).then((info) => {
			const video = info.formats.find((format) => format.hasVideo && !format.hasAudio);
			if (!video) {
				return res.status(404).json({ error: 'No video found' });
			};
			res.setHeader('Content-Disposition', `attachment; filename="${info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_')}.${video.container}"`);
			res.setHeader('Content-Type', `video/${video.container}`);
			axios({
				url: video.url,
				method: 'GET',
				responseType: 'stream'
			}).then((response) => {
				response.data.pipe(res);
			}).catch((error) => {
				res.status(500).json({
					error: error.message,
					variables: {
						id: id
					}
				});
			});
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
	song.get('/:id/stream/audio/', async (req, res) => {
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
			// Find the url with highest quality
			/**
			 * @type {Resource}
			 */
			const resources = response.data;
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

			axios({
				url: highestQualityUrl.url,
				method: 'GET',
				responseType: 'stream'
			}).then((response) => {
				res.setHeader('Content-Disposition', `attachment; filename="${highestQualityResource.meta.title.replace(/[^a-zA-Z0-9]/g, '_')}.${highestQualityUrl.extension}"`);
				res.setHeader('Content-Type', `audio/${highestQualityUrl.extension}`);
				response.data.pipe(res);
			}).catch((error) => {
				res.status(500).json({
					error: error.message,
					variables: {
						id: id
					}
				});
			});
		}).catch((error) => {
			res.status(500).json({
				error: error.message,
				variables: {
					id: id
				}
			});
		});
	});
	song.get('/:id/stream/video/', async (req, res) => {
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
			// Find the url with highest quality
			/**
			 * @type {Resource}
			 */
			const resources = response.data;
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

			axios({
				url: highestQualityUrl.url,
				method: 'GET',
				responseType: 'stream'
			}).then((response) => {
				res.setHeader('Content-Disposition', `attachment; filename="${highestQualityResource.meta.title.replace(/[^a-zA-Z0-9]/g, '_')}.${highestQualityUrl.extension}"`);
				res.setHeader('Content-Type', `video/${highestQualityUrl.extension}`);
				response.data.pipe(res);
			}).catch((error) => {
				res.status(500).json({
					error: error.message,
					variables: {
						id: id
					}
				});
			});
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