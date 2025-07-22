export type UserProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  role: 'Sugar Daddy' | 'Sugar Mommy' | 'Sugar Baby';
  sex: 'Male' | 'Female' | 'Other';
  bio: string;
  interests: string[];
  image: string;
  summary?: string;
};

export const users: UserProfile[] = [
  {
    id: '1',
    name: 'Jessica',
    age: 23,
    location: 'New York, NY',
    role: 'Sugar Baby',
    sex: 'Female',
    bio: 'Art student who loves exploring galleries and trying new cuisines. Looking for a mentor to share life experiences with and enjoy the finer things in life.',
    interests: ['Art', 'Fine Dining', 'Travel', 'Photography'],
    image: 'https://placehold.co/400x400.png',
  },
  {
    id: '2',
    name: 'David',
    age: 45,
    location: 'Los Angeles, CA',
    role: 'Sugar Daddy',
    sex: 'Male',
    bio: 'Tech entrepreneur with a passion for sailing and mentoring. I enjoy deep conversations and helping ambitious individuals achieve their dreams. I value honesty and a good sense of humor.',
    interests: ['Sailing', 'Mentoring', 'Wine Tasting', 'Tech'],
    image: 'https://placehold.co/400x400.png',
  },
  {
    id: '3',
    name: 'Emily',
    age: 26,
    location: 'Miami, FL',
    role: 'Sugar Baby',
    sex: 'Female',
    bio: 'Fitness model and yoga instructor. I believe in living a healthy and adventurous life. Seeking a partner who is established, generous, and enjoys an active lifestyle.',
    interests: ['Fitness', 'Yoga', 'Beach', 'Healthy Eating'],
    image: 'https://placehold.co/400x400.png',
  },
  {
    id: '4',
    name: 'Richard',
    age: 52,
    location: 'Chicago, IL',
    role: 'Sugar Daddy',
    sex: 'Male',
    bio: 'Investment banker, world traveler, and philanthropist. I appreciate intelligence, ambition, and elegance. Looking for a companion for cultural events and international travel.',
    interests: ['Travel', 'Philanthropy', 'Opera', 'Fine Art'],
    image: 'https://placehold.co/400x400.png',
  },
  {
    id: '5',
    name: 'Chloe',
    age: 21,
    location: 'Austin, TX',
    role: 'Sugar Baby',
    sex: 'Female',
    bio: 'Musician and university student. I love live music, spontaneous road trips, and learning new things. Hoping to find someone genuine and supportive.',
    interests: ['Music', 'Concerts', 'Road Trips', 'Literature'],
    image: 'https://placehold.co/400x400.png',
  },
  {
    id: '6',
    name: 'Isabella',
    age: 41,
    location: 'San Francisco, CA',
    role: 'Sugar Mommy',
    sex: 'Female',
    bio: 'Successful software CEO and mother of two. My time is precious, so I look for meaningful, no-drama connections. I enjoy fine dining, weekend getaways, and supporting young talent.',
    interests: ['Technology', 'Fine Dining', 'Mentoring', 'Fashion'],
    image: 'https://placehold.co/400x400.png',
  },
  {
    id: '7',
    name: 'Michael',
    age: 30,
    location: 'Denver, CO',
    role: 'Sugar Baby',
    sex: 'Male',
    bio: 'Aspiring architect who loves hiking, skiing, and modern design. I am ambitious and looking for a successful woman to learn from and share adventures with.',
    interests: ['Architecture', 'Hiking', 'Skiing', 'Design'],
    image: 'https://placehold.co/400x400.png',
  },
  {
    id: '8',
    name: 'Sophia',
    age: 24,
    location: 'Boston, MA',
    role: 'Sugar Baby',
    sex: 'Female',
    bio: 'Medical student with a love for history and classical music. I am a great conversationalist and am looking for an established gentleman for companionship.',
    interests: ['Medicine', 'History', 'Classical Music', 'Museums'],
    image: 'https://placehold.co/400x400.png',
  },
   {
    id: '9',
    name: 'James',
    age: 48,
    location: 'Seattle, WA',
    role: 'Sugar Daddy',
    sex: 'Male',
    bio: 'Environmental lawyer who is passionate about nature and conservation. In my free time, I enjoy hiking, kayaking, and documentary films. Seeking an intelligent, eco-conscious companion.',
    interests: ['Nature', 'Law', 'Kayaking', 'Films'],
    image: 'https://placehold.co/400x400.png',
  },
  {
    id: '10',
    name: 'Olivia',
    age: 28,
    location: 'Las Vegas, NV',
    role: 'Sugar Baby',
    sex: 'Female',
    bio: 'Professional dancer and aspiring choreographer. Life is a performance, and I love to live it to the fullest. Seeking a generous partner to enjoy shows, travel, and luxury experiences.',
    interests: ['Dance', 'Shows', 'Luxury', 'Travel'],
    image: 'https://placehold.co/400x400.png',
  },
];

export const getCurrentUser = (): UserProfile => {
  return {
    id: 'current_user',
    name: 'Alex',
    age: 29,
    location: 'San Francisco, CA',
    role: 'Sugar Baby',
    sex: 'Other',
    bio: 'I am a freelance graphic designer with a love for minimalist aesthetics, indie films, and specialty coffee. I appreciate creativity, ambition, and deep conversation. Looking for a generous and wise partner to share new experiences and grow with.',
    interests: ['Graphic Design', 'Indie Films', 'Coffee', 'Art'],
    image: 'https://placehold.co/100x100.png',
  }
}
