"use client"

import { useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { columns } from "./organizations-columns"
import { useQuery } from "@tanstack/react-query"
import { EmptyOrganizations } from "./empty-organizations"
import { Organization } from "@prisma/client"
import { authClient } from "@/lib/auth-client"
import { TableSkeleton } from "../table-skeleton"
import { getOrganizations } from "@/actions/admin"
import { NewOrganizationDrawer } from "./new-organization-drawer"

/* async function getOrganizations() {
  const organizations = await authClient.organization.list()

  const organizationsFullWithMembers = await authClient.organization.getFullOrganization()

  const organizationsWithMembers = organizations.data?.map((organization) => {
    const organizationFull = organizationsFullWithMembers.data?.find((o: any) => o.id === organization.id)
    return {
      ...organization,
      members: organizationFull?.members,
    }
  })


  return organizations
} */

export function OrganizationsList() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  
  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const organizations = await getOrganizations()
      return organizations
    }
  })

  const table = useReactTable({
    data: organizations || [],
    columns: columns as ColumnDef<any>[],
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  if (isLoading) {
    return <TableSkeleton />
  }

  if (!organizations) {
    return <EmptyOrganizations />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-row justify-between ">
      <Input
        placeholder="Filtrar organizaciones..."
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
      <NewOrganizationDrawer />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron organizaciones.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 