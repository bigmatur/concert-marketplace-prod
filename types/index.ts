export type UserRole = 'buyer' | 'vendor' | 'admin';

export type MainCategory = 
  | 'technical'
  | 'transport'
  | 'catering'
  | 'management'
  | 'venues'
  | 'rentals'
  | 'media'
  | 'staff'
  | 'security';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  created_at: string;
}

export interface VendorProfile {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  city: string;
  service_areas?: string[];
  rating?: number;
  verified: boolean;
  main_category: MainCategory;
  subcategories?: string[];
  created_at: string;
}

export interface VenueDetails {
  id: string;
  vendor_id: string;
  venue_type: string;
  address?: string;
  seated_capacity?: number;
  standing_capacity?: number;
  max_capacity?: number;
  dressing_rooms_count?: number;
  indoor_outdoor?: 'indoor' | 'outdoor';
  parking?: string;
  accessibility?: string;
}

export interface Request {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  main_category: MainCategory;
  subcategories?: string[];
  city: string;
  event_date?: string;
  budget_min?: number;
  budget_max?: number;
  expected_audience?: number;
  status: 'draft' | 'published' | 'collecting_responses' | 'completed';
  created_at: string;
}

export interface Application {
  id: string;
  request_id: string;
  vendor_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
}
