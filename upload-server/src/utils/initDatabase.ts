import mongoose from 'mongoose';
import LinkDocument from '../api/models/linkUploadModel';

/**
 * Initialize database collections and indexes
 */
export const initializeDatabase = async () => {
  try {
    console.log('==> Initializing database collections and indexes...');

    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    // Ensure linkDocuments collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('linkDocuments')) {
      await mongoose.connection.db.createCollection('linkDocuments');
      console.log('==> Created collection: linkDocuments');
    } else {
      console.log('✓: Collection already exists: linkDocuments');
    }

    // Create indexes for better query performance
    await LinkDocument.collection.createIndex({ userId: 1 });
    await LinkDocument.collection.createIndex({ applicationId: 1 });
    await LinkDocument.collection.createIndex({ applicationPhase: 1 });
    await LinkDocument.collection.createIndex({ userId: 1, applicationPhase: 1 });

    console.log('==> Database indexes created successfully');

    // Log collection count
    const count = await LinkDocument.collection.countDocuments();
    console.log(`==> linkDocuments collection: ${count} documents`);

  } catch (error) {
    console.error('ERROR: Error initializing database:', error);
    throw error;
  }
};
