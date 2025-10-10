type GoogleResponse = {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
};

type AuthResponse = {
  token: string;
  user: {
    id: string;
    userName: string;
    email: string;
    registeredAt: string;
    favorites: string[];
    documents: string[];
    exchangeBadge?: boolean;
    avatarUrl?: string;
    linkedinUrl?: string;
    user_level_name?: 'Admin' | 'User' | 'Guest';
  };
};

// user type for the DB
type UserInfo = {
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
  GoogleResponse,
  AuthResponse,
  UserInfo
};
