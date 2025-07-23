export type UserProfile = {
  id: string;
  email: string;
  password?: string; // Storing hashed password
  name: string;
  age: number;
  location: string;
  role: 'Admin' | 'Sugar Daddy' | 'Sugar Baby';
  sex: 'Male' | 'Female ';
  bio: string;
  interests: string[];
  image: string;
  summary?: string;
};
