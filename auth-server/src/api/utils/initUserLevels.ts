import UserLevel from '../models/userLevelModel';

export const initializeUserLevels = async () => {
  try {
    // Check if user levels already exist
    const count = await UserLevel.countDocuments();
    if (count > 0) {
      return;
    }

    // Create default user levels
    const defaultLevels = [
      {user_level_id: 1, level_name: 'User'},
      {user_level_id: 2, level_name: 'Admin'},
      {user_level_id: 3, level_name: 'SuperAdmin'},
    ];

    await UserLevel.insertMany(defaultLevels);
  } catch (error) {
    console.error('Error initializing user levels:', error);
    throw error;
  }
};
