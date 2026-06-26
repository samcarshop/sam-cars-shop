export interface Spec {
  label: string;
  value: string;
}

export interface VehicleDocument {
  name: string;
  url: string;
  size?: number;
  type: string;
}

export interface Vehicle {
  id: string;
  name: string;
  category: string;
  year: string;
  km: string;
  fuel: string;
  price: string;
  description: string;
  image: string;
  gallery: string[];
  video_url?: string;
  specs: Spec[];
  documents?: VehicleDocument[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type VehicleInput = Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>;
