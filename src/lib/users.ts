
export type UserProfile = {
  id: string;
  email: string;
  password?: string; // Storing hashed password
  name: string;
  age: number;
  location: string;
  role: 'Admin' | 'Sugar Daddy' | 'Sugar Baby';
  sex: 'Male' | 'Female';
  bio: string;
  interests: string[];
  image: string;
  summary?: string;
  wants?: string[];
  gallery?: string[];
  privateGallery?: string[];
  height?: string;
  bodyType?: string;
  ethnicity?: string;
  hairColor?: string;
  eyeColor?: string;
  smoker?: string;
  drinker?: string;
  piercings?: string;
  tattoos?: string;
  relationshipStatus?: string;
  children?: string;
  credits?: number;
  verifiedUntil?: string;
};
