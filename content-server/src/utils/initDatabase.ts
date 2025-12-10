import mongoose from 'mongoose';
import Story from '../api/models/storyModel';
import User from '../api/models/userModel';


/**
 * Initialize database collections and indexes
 */
export const initializeDatabase = async () => {
  try {
    console.log('==> Initializing database collections and indexes...');

    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    // Ensure collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('exchangeStories')) {
      await mongoose.connection.db.createCollection('exchangeStories');
      console.log('==> Created collection: exchangeStories');
    } else {
      console.log('NOTICE: Collection already exists: exchangeStories');
    }

    if (!collectionNames.includes('users')) {
      await mongoose.connection.db.createCollection('users');
      console.log('==> Created collection: users');
    } else {
      console.log('NOTICE: Collection already exists: users');
    }

    // Create indexes for better query performance
    await Story.collection.createIndex({ country: 1 });
    await Story.collection.createIndex({ university: 1 });
    await Story.collection.createIndex({ isApproved: 1 });
    await Story.collection.createIndex({ createdBy: 1 });
    await Story.collection.createIndex({ createdAt: -1 });

    //await User.collection.createIndex({ googleId: 1 }, { unique: true }); removed because of duplicate indexes error
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ user_level_id: 1 });

    console.log('==> Database indexes created successfully');

    // Log collection counts
    const storyCount = await Story.collection.countDocuments();
    const userCount = await User.collection.countDocuments();

    console.log(`==> exchangeStories collection: ${storyCount} documents`);
    console.log(`==> users collection: ${userCount} documents`);

  } catch (error) {
    console.error('ERROR: Error initializing database:', error);
    throw error;
  }
};
