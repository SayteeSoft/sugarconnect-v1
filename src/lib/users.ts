export type UserProfile = {
  id: string;
  email: string;
  name: string;
  age: number;
  location: string;
  role: 'Admin' | 'Sugar Daddy' | 'Sugar Baby';
  sex: 'Male' | 'Female' | 'Other';
  bio: string;
  interests: string[];
  image: string;
  summary?: string;
};
