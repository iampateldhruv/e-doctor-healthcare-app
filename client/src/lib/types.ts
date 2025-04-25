// Frontend type definitions
export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string;
}

export interface Doctor {
  id: number;
  userId: number;
  specialization: string;
  hospital: string;
  rating: string;
  reviewCount: number;
  description: string;
  experience: string;
  nextAvailable: string;
  availability: string;
  user: User;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  doctor?: Doctor;
  patient?: User;
}

export interface Notification {
  id: number;
  userId: number;
  type: 'appointment' | 'prescription' | 'consultation';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata: Record<string, any>;
}

export interface Medicine {
  id: number;
  name: string;
  genericName?: string;
  manufacturer: string;
  dosage: string;
  count?: string;
  category: string;
  type: 'prescription' | 'otc';
  price: string;
  description: string;
  usage: string;
  sideEffects?: string;
  storage?: string;
  image?: string;
  thumbnails?: string[];
  requiredPrescription: boolean;
}

export interface Prescription {
  id: number;
  userId: number;
  filePath: string;
  status: 'pending' | 'verified' | 'rejected';
  isUrgent: boolean;
  createdAt: string;
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  authorId: number;
  category: string;
  tags: string[];
  views: number;
  publishedAt: string;
  author?: User;
}

export interface Comment {
  id: number;
  blogId: number;
  userId: number;
  content: string;
  likes: number;
  createdAt: string;
  parentId?: number;
  user?: User;
  replies?: Comment[];
}
