
export interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  name_he: string;
  description_ar: string;
  description_en: string;
  description_he: string;
  price: number;
  original_price?: number;
  wholesale_price?: number;
  image: string;
  category_id: string;
  in_stock: boolean;
  discount?: number;
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  icon: string;
  count: number;
}

export interface ProductFormData {
  name_ar: string;
  name_en: string;
  name_he: string;
  description_ar: string;
  description_en: string;
  description_he: string;
  price: number;
  original_price: number;
  wholesale_price: number;
  image: string;
  category_id: string;
  in_stock: boolean;
  discount: number;
  featured: boolean;
}
