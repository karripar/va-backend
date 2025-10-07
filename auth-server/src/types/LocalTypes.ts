type UserLevel = {
  user_level_id: number;
  level_name: 'Admin' | 'User' | 'Guest';
};

type UserInfo = {
  id: string;
  googleId: string;
  userName: string;
  email: string;
  registeredAt: Date;
  favorites: string[];
  documents: string[];
  exchangeBadge?: boolean;
  avatarUrl?: string;
  linkedinUrl?: string;
  user_level_name?: 'Admin' | 'User' | 'Guest';
};

type UserWithLevel = UserInfo & {level: UserLevel};

type TokenContent = Pick<UserInfo, 'id' | 'user_level_name'>;

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

export type {UserLevel, UserWithLevel, TokenContent, UserInfo, GoogleResponse, AuthResponse};
