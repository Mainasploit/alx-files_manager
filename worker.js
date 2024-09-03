import Queue from 'bull';
import imageThumbnail from 'image-thumbnail';
import { promises as fs } from 'fs';
import { ObjectID } from 'mongodb';
import dbClient from './utils/db';

const fileProcessingQueue = new Queue('fileQueue', 'redis://127.0.0.1:6379');
const userProcessingQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

async function generateThumbnail(width, localPath) {
	const thumbnail = await imageThumbnail(localPath, { width });
	return thumbnail;
}

fileProcessingQueue.process(async (job, done) => {
	console.log('Starting file processing...');
	const { fileId } = job.data;
	if (!fileId) {
		return done(new Error('File ID is missing'));
	}

	const { userId } = job.data;
	if (!userId) {
		return done(new Error('User ID is missing'));
	}

	console.log(`Processing file with ID: ${fileId}, for user: ${userId}`);
	const filesCollection = dbClient.db.collection('files');
	const documentId = new ObjectID(fileId);

	filesCollection.findOne({ _id: documentId }, async (err, file) => {
		if (!file) {
			console.log('File not found in database');
			return done(new Error('File not found'));
		} else {
			const filePath = file.localPath;
			const thumbnail500 = await generateThumbnail(500, filePath);
			const thumbnail250 = await generateThumbnail(250, filePath);
			const thumbnail100 = await generateThumbnail(100, filePath);

			console.log('Saving thumbnails to the file system...');
			const image500Path = `${file.localPath}_500`;
			const image250Path = `${file.localPath}_250`;
			const image100Path = `${file.localPath}_100`;

			await fs.writeFile(image500Path, thumbnail500);
			await fs.writeFile(image250Path, thumbnail250);
			await fs.writeFile(image100Path, thumbnail100);
			done();
		}
	});
});

userProcessingQueue.process(async (job, done) => {
	const { userId } = job.data;
	if (!userId) return done(new Error('User ID is missing'));

	const usersCollection = dbClient.db.collection('users');
	const documentId = new ObjectID(userId);
	const user = await usersCollection.findOne({ _id: documentId });

	if (user) {
		console.log(`Welcome aboard, ${user.email}!`);
	} else {
		return done(new Error('User not found in the database'));
	}
});
