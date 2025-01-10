import { Card } from "@/components/ui/card";

export const PaymentSummary = ({ receivables }: { receivables: any[] }) => {
  const getTotals = () => {
    return receivables.reduce(
      (acc, r) => ({
        overdue: acc.overdue + (r.isPastDue ? r.amountCents : 0),
        pending: acc.pending + (!r.isPastDue ? r.amountCents : 0),
        total: acc.total + r.amountCents,
      }),
      { overdue: 0, pending: 0, total: 0 }
    );
  };

  const { overdue, pending, total } = getTotals();

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="text-sm text-gray-600">Total vencido</div>
        <div className="text-xl font-bold text-red-500">
          ${(overdue / 100).toFixed(2)}
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-sm text-gray-600">Total por vencer</div>
        <div className="text-xl font-bold">
          ${(pending / 100).toFixed(2)}
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-sm text-gray-600">Total a pagar</div>
        <div className="text-xl font-bold">
          ${(total / 100).toFixed(2)}
        </div>
      </Card>
    </div>
  );
};