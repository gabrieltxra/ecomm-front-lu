export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number; 
  stock: number;
  ncm_code: string;
  created_at: Date;
  updated_at: Date;
  status: 'active' | 'inactive' | 'out_of_stock';
  image_url?: string;
}