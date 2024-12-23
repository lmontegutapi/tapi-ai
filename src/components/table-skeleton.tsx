import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TableSkeletonProps {
  rowCount?: number
  columnCount?: number
}

export function TableSkeleton({ 
  rowCount = 5, 
  columnCount = 5 
}: TableSkeletonProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array(columnCount).fill(null).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-[100px]" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(rowCount).fill(null).map((_, i) => (
            <TableRow key={i}>
              {Array(columnCount).fill(null).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}