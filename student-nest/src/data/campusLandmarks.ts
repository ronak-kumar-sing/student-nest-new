export interface CampusLandmark {
  id: string;
  name: string;
  shortName: string;
  city: string;
  lat: number;
  lng: number;
  type: 'university' | 'metro' | 'library';
}

export const CAMPUS_LANDMARKS: CampusLandmark[] = [
  // Cambridge / Boston
  {
    id: 'harvard',
    name: 'Harvard University Yard',
    shortName: 'Harvard Yard',
    city: 'Cambridge',
    lat: 42.3770,
    lng: -71.1167,
    type: 'university',
  },
  {
    id: 'mit',
    name: 'MIT / Kendall Square',
    shortName: 'MIT Kendall',
    city: 'Cambridge',
    lat: 42.3601,
    lng: -71.0942,
    type: 'university',
  },
  {
    id: 'northeastern',
    name: 'Northeastern University',
    shortName: 'Northeastern',
    city: 'Boston',
    lat: 42.3398,
    lng: -71.0891,
    type: 'university',
  },
  {
    id: 'bu',
    name: 'Boston University Central',
    shortName: 'Boston Univ',
    city: 'Boston',
    lat: 42.3505,
    lng: -71.1054,
    type: 'university',
  },
  {
    id: 'tufts',
    name: 'Tufts University Medford',
    shortName: 'Tufts',
    city: 'Somerville',
    lat: 42.4075,
    lng: -71.1190,
    type: 'university',
  },

  // Pune
  {
    id: 'coep',
    name: 'COEP Technological University',
    shortName: 'COEP Tech',
    city: 'Pune',
    lat: 18.5293,
    lng: 73.8565,
    type: 'university',
  },
  {
    id: 'fergusson',
    name: 'Fergusson College FC Road',
    shortName: 'Fergusson College',
    city: 'Pune',
    lat: 18.5244,
    lng: 73.8407,
    type: 'university',
  },
  {
    id: 'pune-univ',
    name: 'Savitribai Phule Pune University',
    shortName: 'Pune Univ',
    city: 'Pune',
    lat: 18.5529,
    lng: 73.8247,
    type: 'university',
  },

  // Delhi
  {
    id: 'iit-delhi',
    name: 'IIT Delhi Hauz Khas',
    shortName: 'IIT Delhi',
    city: 'Delhi',
    lat: 28.5450,
    lng: 77.1926,
    type: 'university',
  },
  {
    id: 'du-north',
    name: 'Delhi University North Campus',
    shortName: 'DU North Campus',
    city: 'Delhi',
    lat: 28.6904,
    lng: 77.2075,
    type: 'university',
  },

  // Bangalore
  {
    id: 'iisc',
    name: 'Indian Institute of Science (IISc)',
    shortName: 'IISc Bangalore',
    city: 'Bangalore',
    lat: 13.0219,
    lng: 77.5671,
    type: 'university',
  },

  // Mumbai
  {
    id: 'iit-bombay',
    name: 'IIT Bombay Powai',
    shortName: 'IIT Bombay',
    city: 'Mumbai',
    lat: 19.1334,
    lng: 72.9133,
    type: 'university',
  },
];
