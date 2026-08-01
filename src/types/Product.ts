export interface Product {
  id: number;
  variant_group_id?: string;
  variant_label?: string | null;
  name: string;
  description: string;
  category: string;
  price: number; 
  stock: number;
  ncm_code: string;
  created_at: Date;
  updated_at: Date;
  status: 'active' | 'inactive' | 'out_of_stock';
  image_urls?: string[];
}
