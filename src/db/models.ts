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
