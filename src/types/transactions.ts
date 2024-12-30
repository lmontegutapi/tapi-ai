export type Transaction = {
  id: string;
  date: string;
  fromTo: string;
  invoice?: string;
  user: string;
  type: 'Retiro' | 'Depósito' | 'Anticipo';
  amount: number;
  status: 'Procesado' | 'Pendiente' | 'Fallido';
};