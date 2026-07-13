import { useState, memo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react'
import EmptyState from './EmptyState'
import { Users } from 'lucide-react'

// Memoized row used in selection mode: a checkbox toggle only re-renders the
// affected row instead of every heavy cell (dropdowns, selects, popovers) on
// the page. Row references stay stable while data/columns are stable, so the
// compare only needs the row object + its selected flag. Callers using
// selection must keep their column defs referentially stable (useMemo).
const SelectableRow = memo(function SelectableRow({ row, isSelected }) {
  return (
    <TableRow
      data-state={isSelected ? 'selected' : undefined}
      className="hover:bg-brand-50/40 transition-colors border-gray-50 group data-[state=selected]:bg-brand-50/60"
    >
      {row.getVisibleCells().map(cell => (
        <TableCell
          key={cell.id}
          className={`py-3.5${cell.column.columnDef.meta?.className ? ' ' + cell.column.columnDef.meta.className : ''}`}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}, (prev, next) => prev.row === next.row && prev.isSelected === next.isSelected)

export default function DataTable({
  data = [],
  columns = [],
  // Server-side pagination props (pass these when using Inertia pagination)
  pagination,          // { current_page, last_page, per_page, total, from, to }
  onPageChange,        // (page: number) => void
  // Client-side sorting
  sorting: externalSorting,
  onSortingChange: onExternalSortingChange,
  // Row selection (optional) — pass all three to enable checkbox selection
  rowSelection,        // { [rowId]: true }
  onRowSelectionChange,
  getRowId,            // (row) => string
  loading = false,
  perPageSelector,     // optional slot rendered next to "Showing X–Y" text
}) {
  const [sorting, setSorting] = useState([])

  const activeSorting = externalSorting ?? sorting
  const handleSortingChange = onExternalSortingChange ?? setSorting
  const selectable = !!onRowSelectionChange

  const table = useReactTable({
    data,
    columns,
    state: { sorting: activeSorting, ...(selectable ? { rowSelection: rowSelection ?? {} } : {}) },
    onSortingChange: handleSortingChange,
    ...(selectable ? { onRowSelectionChange, enableRowSelection: true } : {}),
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: !!pagination,
    pageCount: pagination?.last_page ?? -1,
  })

  const isServerPaged = !!pagination

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="bg-brand-50/50 hover:bg-brand-50/50 border-gray-100">
                {hg.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className={`text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-3 select-none${header.column.columnDef.meta?.className ? ' ' + header.column.columnDef.meta.className : ''}`}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default', width: header.column.columnDef.size }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-gray-300">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp size={13} className="text-brand-600" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown size={13} className="text-brand-600" />
                          ) : (
                            <ChevronsUpDown size={13} />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-gray-50">
                  {columns.map((_, ci) => (
                    <TableCell key={ci} className="py-3.5">
                      <div className="h-4 bg-slate-100 animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => selectable ? (
                <SelectableRow key={row.id} row={row} isSelected={row.getIsSelected()} />
              ) : (
                <TableRow key={row.id} className="hover:bg-brand-50/40 transition-colors border-gray-50 group">
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className={`py-3.5${cell.column.columnDef.meta?.className ? ' ' + cell.column.columnDef.meta.className : ''}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 p-0">
                  <EmptyState icon={Users} title="No records found" description="Try adjusting your filters." />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Pagination */}
      {isServerPaged && pagination.last_page > 1 && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              Showing {pagination.from}–{pagination.to} of {pagination.total} results
            </p>
            {perPageSelector}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8"
              onClick={() => onPageChange(1)} disabled={pagination.current_page === 1}>
              <ChevronsLeft size={14} />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8"
              onClick={() => onPageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1}>
              <ChevronLeft size={14} />
            </Button>
            <span className="text-xs font-medium px-2 text-gray-600">
              {pagination.current_page} / {pagination.last_page}
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8"
              onClick={() => onPageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page}>
              <ChevronRight size={14} />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8"
              onClick={() => onPageChange(pagination.last_page)} disabled={pagination.current_page === pagination.last_page}>
              <ChevronsRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
