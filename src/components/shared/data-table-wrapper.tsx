import { Suspense } from "react";
import { DataTable } from "./data-table";
import { TableSkeleton } from "@/components/table-skeleton";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";

interface DataTableWrapperProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  EmptyStateComponent: React.ComponentType;
  searchKey?: string;
  defaultVisibility?: VisibilityState;
  actionComponent?: React.ReactNode;
  secondaryActionComponent?: React.ReactNode;
 }
 
 export function DataTableWrapper<TData>({
  data,
  columns,
  EmptyStateComponent,
  ...props
 }: DataTableWrapperProps<TData>) {
  if (!Array.isArray(data) || data.length === 0) {
    return <EmptyStateComponent />;
  }
 
  return (
    <Suspense fallback={<TableSkeleton columnCount={columns.length} rowCount={5} />}>
      <DataTable 
        columns={columns} 
        data={data}
        {...props}
      />
    </Suspense>
  );
 }