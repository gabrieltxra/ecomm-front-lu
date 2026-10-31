export interface Product {
  id: string;
  variant_group_id?: string;
  variant_label?: string | null;
  variant_count?: number;
  selected_variant_id?: string;
  variants?: Product[];
  price_min?: number;
  price_max?: number;
  name: string;
  description: string;
  category: string;
  price: number; 
  stock: number;
  ncm_code: string;
  created_at: string | Date;
  updated_at: string | Date;
  status: 'active' | 'inactive' | 'out_of_stock';
  image_urls?: string[];
  height?: number;
  width?: number;
  length?: number;
  weight?: number;
}
