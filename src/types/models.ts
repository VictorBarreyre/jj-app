import { create } from 'zustand';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  measurements?: Measurement[];
}

export interface Measurement {
  id: string;
  customerId: string;
  date: Date;
  vendorId: string;
  outfit: {
    jacket?: OutfitItem;
    vest?: OutfitItem;
    pants?: OutfitItem;
  };
  hatSize?: string;
  shoeSize?: string;
  notes?: string;
}

export interface OutfitItem {
  model: string;
  size: string;
  length?: string;
}

export interface Rental {
  id: string;
  number: number;
  customerId: string;
  eventDate: Date;
  pickupDate: Date;
  returnDate: Date;
  items: RentalItem[];
  pricing: {
    rentalPrice: number;
    deposit: number;
    downPayment: number;
  };
  payment: {
    paidDate?: Date;
    method?: PaymentMethod;
    returnedDate?: Date;
  };
  groupId?: string;
}