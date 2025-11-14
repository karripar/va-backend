import userModel from "../models/userModel";

const getAdminEmails = async (): Promise<string[]> => {
  const admins = await userModel.find({ user_level_id: 2 }, 'email');
  console.log("Emails mapped: ", admins.map(admin => admin.email));
  return admins.map(admin => admin.email);
};

export { getAdminEmails };
