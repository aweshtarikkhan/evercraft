export type Page = "home" | "shop" | "about" | "services" | "service" | "publish" | "contact" | "cart" | "book" | "admin" | "read";

export interface Book {
  id: number;
  title: string;
  titleHindi: string;
  author: string;
  authorHindi: string;
  price: number;
  mrp: number;
  genre: string;
  language: string;
  pages: number;
  isbn: string;
  description: string;
  descriptionHindi: string;
  amazonLink: string;
  flipkartLink: string;
  ondcLink: string;
  badge: string;
  rating: number;
  reviews: number;
  available: boolean;
  stock: number;
  publisher: string;
  frontCover: string;
  backCover: string;
  is_hero: boolean;
  is_bestseller: boolean;
  is_upcoming: boolean;
  release_date: string;
}

export interface CartItem extends Book { qty: number; }

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  profile_image?: string;
  role?: string;
}
