import { Suspense } from 'react';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {mockTransactions} from "@/mocks/transactions"
import { columns } from '@/components/transactions/columns';

export default async function TransactionsPage() {
  const transactions = [...mockTransactions] as any[];

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Transacciones</h1>
      </div>

      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <TransactionsTable data={transactions} columns={columns} />
      </Suspense>
    </div>
  );
}