export interface User {
  email: string;
  password: string;
}

export interface Address {
  address_id: string;
  zipcode: string;
  street_num: string;
  street_name: string;
}

export interface ZipcodeInfo {
  zipcode: string;
  city: string;
  state: string;
}

export interface Helpdesk {
  email: string;
  position: string;
}

export interface Buyer {
  email: string;
  business_name: string;
  buyer_address_id: string;
}

export interface Seller {
  email: string;
  business_name: string;
  business_address_id: string;
  bank_routing_number: string;
  bank_account_number: string;
  balance: number;
}

export interface Request {
  request_id: string;
  seller_email: string;
  helpdesk_staff_email: string;
  request_type: string;
  request_desc: string;
  request_status: number;
}

export interface Credit_Card {
  credit_card_num: string;
  card_type: string;
  expire_month: string;
  expire_year: string;
  security_code: string;
  owner_email: string;
}

export interface Category {
  parent_category: string;
  category_name: string;
}

export interface Product_Listing {
  seller_email: string;
  listing_id: number;
  category: string;
  product_title: string;
  product_name: string;
  product_description: string;
  quantity: number;
  product_price: number;
  status: number;
}

export interface Order {
  order_id: number;
  seller_email: string;
  listing_id: number;
  buyer_email: string;
  date: string;
  quantity: number;
  payment: number;
}

export interface ProductOrder extends Order, Product_Listing {}

export interface Review {
  order_id: number;
  rating: number;
  review_desc: string;
}

export interface CartItemRaw {
  buyer_email: string;
  listing_seller_email: string;
  listing_id: number;
  quantity: number;
}

export interface CartItem {
  product: Product_Listing;
  quantity: number;
}

export type UserRole = "Helpdesk" | "Buyer" | "Seller" | null;

export interface Shopping_Cart {
  buyer_email: string;
  listing_seller_email: string;
  listing_id: number;
  quantity: number;
}
