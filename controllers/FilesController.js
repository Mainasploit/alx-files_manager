import { v4 as generateUUID } from 'uuid';
import { promises as fs } from 'fs';
import { ObjectId } from 'mongodb';
import mime from 'mime-types';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const fileQueue = new Queue('fileQueue', 'redis://127.0.0.1:6379');

class FilesController {
  static async getUser(req) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (userId) {
      const usersCollection = dbClient.db.collection('users');
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      if (user) return user;
    }
    return null;
  }

  static async uploadFile(req, res) {
    const user = await FilesController.getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    const { name, type, parentId, isPublic = false, data } = req.body;
    if (!name || !type || (type !== 'folder' && !data)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const filesCollection = dbClient.db.collection('files');
    if (parentId) {
      const parentFile = await filesCollection.findOne({ _id: new ObjectId(parentId), userId: user._id });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent file not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    if (type === 'folder') {
      try {
        const result = await filesCollection.insertOne({
          userId: user._id,
          name,
          type,
          parentId: parentId || 0,
          isPublic,
        });
        return res.status(201).json({ id: result.insertedId, userId: user._id, name, type, isPublic, parentId: parentId || 0 });
      } catch (error) {
        console.error('Error inserting folder:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      const storagePath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileName = `${storagePath}/${generateUUID()}`;
      const buffer = Buffer.from(data, 'base64');

      try {
        await fs.mkdir(storagePath, { recursive: true });
        await fs.writeFile(fileName, buffer, 'utf-8');
        const result = await filesCollection.insertOne({
          userId: user._id,
          name,
          type,
          isPublic,
          parentId: parentId || 0,
          localPath: fileName,
        });

        if (type === 'image') {
          fileQueue.add({ userId: user._id, fileId: result.insertedId });
        }

        return res.status(201).json({ id: result.insertedId, userId: user._id, name, type, isPublic, parentId: parentId || 0 });
      } catch (error) {
        console.error('Error uploading file:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  static async showFileDetails(req, res) {
    const user = await FilesController.getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    const fileId = req.params.id;
    const filesCollection = dbClient.db.collection('files');
    const file = await filesCollection.findOne({ _id: new ObjectId(fileId), userId: user._id });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    return res.status(200).json(file);
  }

  static async listFiles(req, res) {
    const user = await FilesController.getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    const { parentId, page = 0 } = req.query;
    const filesCollection = dbClient.db.collection('files');

    const query = parentId ? { userId: user._id, parentId: new ObjectId(parentId) } : { userId: user._id };
    
    try {
      const results = await filesCollection.aggregate([
        { $match: query },
        { $sort: { _id: -1 } },
        {
          $facet: {
            metadata: [{ $count: 'total' }, { $addFields: { page: parseInt(page, 10) } }],
            data: [{ $skip: 20 * parseInt(page, 10) }, { $limit: 20 }],
          },
        },
      ]).toArray();

      const formattedResults = results[0].data.map(file => ({
        ...file,
        id: file._id,
        localPath: undefined, // Remove localPath for security
      }));

      return res.status(200).json(formattedResults);
    } catch (error) {
      console.error('Error listing files:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async publishFile(req, res) {
    const user = await FilesController.getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    const { id } = req.params;
    const filesCollection = dbClient.db.collection('files');
    const result = await filesCollection.findOneAndUpdate(
      { _id: new ObjectId(id), userId: user._id },
      { $set: { isPublic: true } },
      { returnOriginal: false }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'File not found' });
    }

    return res.status(200).json(result.value);
  }

  static async unpublishFile(req, res) {
    const user = await FilesController.getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    const { id } = req.params;
    const filesCollection = dbClient.db.collection('files');
    const result = await filesCollection.findOneAndUpdate(
      { _id: new ObjectId(id), userId: user._id },
      { $set: { isPublic: false } },
      { returnOriginal: false }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'File not found' });
    }

    return res.status(200).json(result.value);
  }

  static async serveFile(req, res) {
    const { id } = req.params;
    const filesCollection = dbClient.db.collection('files');
    const file = await filesCollection.findOne({ _id: new ObjectId(id) });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.isPublic || (await FilesController.getUser(req))?.userId.toString() === file.userId.toString()) {
      if (file.type === 'folder') {
        return res.status(400).json({ error: 'Folders cannot be served' });
      }

      const size = req.query.size;
      let fileName = file.localPath;
      if (size) {
        fileName = `${file.localPath}_${size}`;
      }

      try {
        const contentType = mime.contentType(file.name);
        const fileData = await fs.readFile(fileName);
        return res.header('Content-Type', contentType).status(200).send(fileData);
      } catch (error) {
        console.error('Error serving file:', error);
        return res.status(404).json({ error: 'File not found' });
      }
    }

    return res.status(403).json({ error: 'Forbidden access' });
  }
}

export default FilesController;
