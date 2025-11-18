import userModel from '../models/userModel';

export const initializeAdmins = async (): Promise<void> => {
  try {
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);

    for (const email of adminEmails) {
      let user = await userModel.findOne({email});

      if (!user) {
        // Create initial admin account placeholder
        user = new userModel({
          userName: email.split('@')[0],
          email,
          user_level_id: 2, // Admin
          registeredAt: new Date(),
        });
        await user.save();
        console.log(`Created initial Admin for ${email}`);
      } else if (user.user_level_id !== 2) {
        user.user_level_id = 2; // promote existing user
        await user.save();
        console.log(`Promoted ${email} to Admin`);
      }
    }
    const elevatedAdminEmails = (process.env.ELEVATED_ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);

    for (const email of elevatedAdminEmails) {
      let user = await userModel.findOne({email});

      if (!user) {
        // Create initial admin account placeholder
        user = new userModel({
          userName: email.split('@')[0],
          email,
          user_level_id: 3, // SuperAdmin
          registeredAt: new Date(),
        });
        await user.save();
        console.log(`Created initial SuperAdmin for ${email}`);
      } else if (user.user_level_id !== 3) {
        user.user_level_id = 3; // promote existing user
        await user.save();
        console.log(`Promoted ${email} to SuperAdmin`);
      }
    }
  } catch (error) {
    console.error('Error initializing admins:', error);
    throw error;
  }
};
