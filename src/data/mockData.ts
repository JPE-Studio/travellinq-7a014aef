
import { User, Post } from '../types';

export const currentUser: User = {
  id: 'user-1',
  pseudonym: 'MountainNomad',
  avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=200&auto=format&fit=crop',
  bio: 'Exploring the world one mountain at a time',
  joinedAt: new Date('2023-06-15')
};

export const mockUsers: User[] = [
  currentUser,
  {
    id: 'user-2',
    pseudonym: 'CoastalCruiser',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    joinedAt: new Date('2023-05-10')
  },
  {
    id: 'user-3',
    pseudonym: 'DesertDrifter',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    bio: 'Finding peace in the vastness of deserts',
    joinedAt: new Date('2023-07-22')
  },
  {
    id: 'user-4',
    pseudonym: 'ForestWanderer',
    joinedAt: new Date('2023-04-18')
  },
  {
    id: 'user-5',
    pseudonym: 'LakesideRoamer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    joinedAt: new Date('2023-08-05')
  }
];

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    author: mockUsers[1],
    text: "Found this amazing hidden spot by the river. Perfect for overnight parking with gorgeous sunset views! There's fresh water nearby and the cell signal is surprisingly good.",
    images: [
      'https://images.unsplash.com/photo-1533873984035-25970ab07461?q=80&w=400&auto=format&fit=crop'
    ],
    category: 'campsite',
    location: { lat: 45.5231, lng: -122.6765 },
    distance: 3.2,
    votes: 18,
    createdAt: new Date('2023-09-15T08:30:00'),
    commentCount: 5
  },
  {
    id: 'post-2',
    author: mockUsers[2],
    text: "Has anyone found a good mechanic in this area? My van is making some strange noise and I need someone who understands camper vans.",
    category: 'service',
    location: { lat: 45.5012, lng: -122.6655 },
    distance: 5.8,
    votes: 7,
    createdAt: new Date('2023-09-14T16:45:00'),
    commentCount: 12
  },
  {
    id: 'post-3',
    author: mockUsers[3],
    text: "The sunset here is absolutely incredible tonight. If you're nearby, head to Pine Ridge viewpoint! Worth the drive up.",
    images: [
      'https://images.unsplash.com/photo-1506038634487-60a69ae4b7b1?q=80&w=400&auto=format&fit=crop'
    ],
    category: 'general',
    location: { lat: 45.4812, lng: -122.7095 },
    distance: 8.4,
    votes: 26,
    createdAt: new Date('2023-09-14T19:20:00'),
    commentCount: 3
  },
  {
    id: 'post-4',
    author: mockUsers[4],
    text: "This forest service road has several pull-offs with great tree cover. Stayed two nights and only saw one ranger who was super friendly. No facilities but very peaceful.",
    images: [
      'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=400&auto=format&fit=crop'
    ],
    category: 'campsite',
    location: { lat: 45.5342, lng: -122.6925 },
    distance: 4.1,
    votes: 14,
    createdAt: new Date('2023-09-13T11:10:00'),
    commentCount: 8
  },
  {
    id: 'post-5',
    author: mockUsers[0],
    text: "Does anyone know if the water at Pinecrest Lake is safe for drinking after filtering? Planning to refill my tanks there tomorrow.",
    category: 'question',
    location: { lat: 45.5172, lng: -122.6412 },
    distance: 2.9,
    votes: 5,
    createdAt: new Date('2023-09-15T09:50:00'),
    commentCount: 7
  }
];
