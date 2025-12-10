import mongoose from 'mongoose';
import Story from '../api/models/storyModel';
import User from '../api/models/userModel';
import { InstructionLink } from '../api/models/instructionModel';

/**
 * Initialize database collections and indexes
 */
export const initializeDatabase = async () => {
  try {
<<<<<<< HEAD
    console.log(' Initializing database collections and indexes...');
=======
<<<<<<< HEAD
    console.log(' Initializing database collections and indexes...');
=======
    console.log('==> Initializing database collections and indexes...');
>>>>>>> b86a9ce81d039e744dd27e979e116eed320fe429
>>>>>>> dev-test

    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    // Ensure collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('exchangeStories')) {
      await mongoose.connection.db.createCollection('exchangeStories');
<<<<<<< HEAD
      console.log(' Created collection: exchangeStories');
=======
<<<<<<< HEAD
      console.log(' Created collection: exchangeStories');
=======
      console.log('==> Created collection: exchangeStories');
>>>>>>> b86a9ce81d039e744dd27e979e116eed320fe429
>>>>>>> dev-test
    } else {
      console.log('NOTICE: Collection already exists: exchangeStories');
    }

    if (!collectionNames.includes('users')) {
      await mongoose.connection.db.createCollection('users');
<<<<<<< HEAD
      console.log(' Created collection: users');
    } else {
      console.log(' Collection already exists: users');
=======
<<<<<<< HEAD
      console.log(' Created collection: users');
    } else {
      console.log(' Collection already exists: users');
=======
      console.log('==> Created collection: users');
    } else {
      console.log('NOTICE: Collection already exists: users');
>>>>>>> b86a9ce81d039e744dd27e979e116eed320fe429
>>>>>>> dev-test
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

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> dev-test
    console.log(' Database indexes created successfully');

    // Migrating old instruction links from /grants to /profile/hakemukset?tab=budget
    try {
      const result = await InstructionLink.updateMany(
        { stepIndex: 8, href: '/grants' },
        { $set: { href: '/profile/hakemukset?tab=budget' } }
      );
      if (result.modifiedCount > 0) {
        console.log(` Migrated ${result.modifiedCount} instruction link(s) from /grants to /profile/hakemukset?tab=budget`);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (migrationError) {
      console.warn(' Instruction link migration skipped (collection may not exist yet)');
    }
<<<<<<< HEAD
=======
=======
    console.log('==> Database indexes created successfully');
>>>>>>> b86a9ce81d039e744dd27e979e116eed320fe429
>>>>>>> dev-test

    // Log collection counts
    const storyCount = await Story.collection.countDocuments();
    const userCount = await User.collection.countDocuments();

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> dev-test
    console.log(` exchangeStories collection: ${storyCount} documents`);
    console.log(` users collection: ${userCount} documents`);

  } catch (error) {
    console.error(' Error initializing database:', error);
<<<<<<< HEAD
=======
=======
    console.log(`==> exchangeStories collection: ${storyCount} documents`);
    console.log(`==> users collection: ${userCount} documents`);

  } catch (error) {
    console.error('ERROR: Error initializing database:', error);
>>>>>>> b86a9ce81d039e744dd27e979e116eed320fe429
>>>>>>> dev-test
    throw error;
  }
};
