import { UserProfile } from './users';

export const mockUsers: UserProfile[] = [
  {
    id: '1',
    email: 'saytee.software@gmail.com',
    name: 'Admin',
    age: 49,
    location: 'London, UK',
    role: 'Admin',
    sex: 'Male',
    bio: 'Adminitrator',
    interests: ['Art', 'Fine Dining', 'Photography', 'Museums'],
    image: '/user-profiles/Admin_Gemini_Generated_Image(small)-001.jpg',
  },
  {
    id: '2',
    email: 'darianna2@gmail.com',
    name: 'Darianna',
    age: 23,
    location: 'London, UK',
    role: 'Sugar Baby',
    sex: 'Female',
    bio: 'Art student with a love for adventure and exploring new cultures. I enjoy gallery openings, weekend getaways, and trying new restaurants. Seeking a mentor and partner to share lifes beautiful moments with.',
    interests: ['Art', 'Fine Dining', 'Photography', 'Museums'],
    image: '/user-profiles/Darianna_Gemini_Generated_Image(small)-001.jpg',
  },
  {
    id: '3',
    email: 'kateryna3@gmail.com',
    name: 'Kateryna',
    age: 21,
    location: 'Kiev, UA',
    role: 'Sugar Baby',
    sex: 'Female',
    bio: 'Recent graduate starting my career in marketing. Im ambitious, fun-loving, and enjoy nights out as much as quiet nights in. Looking for a confident and established man to learn from.',
    interests: ['Art', 'Fine Dining', 'Photography', 'Museums'],
    image: '/user-profiles/Kateryna_Gemini_Generated_Image(small)-001.jpg',
  },
  {
    id: '4',
    email: 'sofia4gmail.com',
    name: 'Sofia',
    age: 25,
    location: 'Cartagena, CO',
    role: 'Sugar Baby',
    sex: 'Female',
    bio: 'Fashion designer with an eye for beauty and a heart for adventure. Im looking for a sophisticated gentleman to share elegant evenings and exciting journeys with.',
    interests: ['Art', 'Fine Dining', 'Photography', 'Museums'],
    image: '/user-profiles/Sofia_Gemini_Generated_Image(small)-001.jpg',
  },
  {
    id: '5',
    email: 'vanessa5gmail.com',
    name: 'Vanessa',
    age: 21,
    location: 'Franfurt, DE',
    role: 'Sugar Baby',
    sex: 'Female',
    bio: 'University student studying literature. Im a romantic at heart and love poetry, long walks, and deep conversations. Hoping to find a kind, generous man to create beautiful memories with.',
    interests: ['Art', 'Fine Dining', 'Photography', 'Museums'],
    image: '/user-profiles/Vansessa_Gemini_Generated_Image(small)-003.jpg',
  },
  {
    id: '6',
    email: 'mark6gmail.com',
    name: 'Mark',
    age: 41,
    location: 'New York, USA',
    role: 'Sugar Daddy',
    sex: 'Male',
    bio: 'Looking for a hot young girl...',
    interests: ['Art', 'Fine Dining', 'Photography', 'Museums'],
    image: '/user-profiles/Male_Gemini_Generated_Image(small)-002.jpg',
  }, 
  {
    id: '7',
    email: 'cecilia7gmail.com',
    name: 'Cecilia',
    age: 25,
    location: 'Rio, Brazil',
    role: 'Sugar Baby',
    sex: 'Female',
    bio: 'Musician and free spirit. My life is filled with melodies, travel, and laughter. Im searching for a patron and partner who appreciates the arts and has a zest for life.',
    interests: ['Art', 'Fine Dining', 'Photography', 'Museums'],
    image: '/user-profiles/Female_Gemini_Generated_Image(small)-001.jpg',
  },
  {
    id: '8',
    email: 'olivia7gmail.com',
    name: 'Olivia',
    age: 23,
    location: 'Medellín, CO',
    role: 'Sugar Baby',
    sex: 'Female',
    bio: 'Yoga instructor and nature lover. I find peace in the outdoors and joy in healthy living. Seeking a grounded, successful partner who values wellness and authenticity.',
    interests: ['Art', 'Fine Dining', 'Photography', 'Museums'],
    image: '/user-profiles/Female_Gemini_Generated_Image(small)-001.jpg',
  },
];

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
  rating: number;
};

export const mockTestimonials: Testimonial[] = [
  {
    id: '2',
    name: 'Darianna',
    role: 'Sugar Baby',
    quote: 'Art student with a love for adventure and exploring new cultures.',
    image: '/user-profiles/Darianna_Gemini_Generated_Image(small)-001.jpg',
    rating: 5,
  },
  {
    id: '3',
    name: 'Kateryna',
    role: 'Sugar Baby',
    quote: 'Recent graduate starting my career in marketing.',
    image: '/user-profiles/Kateryna_Gemini_Generated_Image(small)-001.jpg',
    rating: 5,
  },
  {
    id: '6',
    name: 'Mark',
    role: 'Sugar Daddy',
    quote: 'Investor and lover of the great outdoors.',
    image: '/user-profiles/Male_Gemini_Generated_Image(small)-002.jpg',
    rating: 5,
  },
    {
    id: '4',
    name: 'Sofia',
    role: 'Sugar Baby',
    quote: 'A perfect platform to meet genuine people.',
    image: '/user-profiles/Sofia_Gemini_Generated_Image(small)-001.jpg',
    rating: 5,
  },
  {
    id: '99', // Placeholder ID for users not in mockUsers
    name: 'John',
    role: 'Sugar Daddy',
    quote: 'Found exactly what I was looking for. Highly recommend.',
    image: '',
    rating: 5,
  },
];
