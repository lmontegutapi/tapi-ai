interface MetricProps {
  title: string;
  value: string | number;
}

export function Metric({ title, value }: MetricProps) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}