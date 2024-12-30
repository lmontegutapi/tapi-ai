export type Contact = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  rfc?: string;
  address?: string;
  paymentTerms?: number;
  identifier: string;
  phones: {
    id: string;
    phone: string;
    type: string;
    isPrimary: boolean;
  }[];
  createdAt: Date;
 };