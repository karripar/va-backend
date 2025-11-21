// user type for the DB
type UserInfo = {
  _id: string;
  googleId: string;
  userName: string;
  email: string;
  user_level_id: number;
  registeredAt: string;
  favorites: string[];
  documents: string[];
  exchangeBadge?: boolean;
  avatarUrl?: string;
  linkedinUrl?: string;
  user_level_name?: 'Admin' | 'User' | 'Guest';
}

export type {
  UserInfo
};
