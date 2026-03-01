'use client';

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { parseAsString, parseAsInteger, useQueryState } from 'nuqs';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Player } from '@/types/game';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatAccuracy } from '@/lib/utils';

const columnHelper = createColumnHelper<Player>();

function LiveProgressCell({ player, sentence }: { player: Player; sentence: string }) {
  const typed = player.currentText ?? '';

  return (
    <span className="font-mono text-sm">
      {typed.split('').map((char, i) => (
        <span key={i} className={char === sentence[i] ? 'text-green-400' : 'text-red-400'}>
          {char}
        </span>
      ))}
      <span className="animate-blink text-violet-400">|</span>
      <span className="text-zinc-600">{sentence.slice(typed.length)}</span>
    </span>
  );
}

const PAGE_SIZE_OPTIONS = [5, 10, 25];

interface PlayersTableProps {
  players: Player[];
  loading: boolean;
  sentence: string;
  currentPlayerId?: string | null;
}

export function PlayersTable({ players, loading, sentence, currentPlayerId }: PlayersTableProps) {
  const [sortColumn, setSortColumn] = useQueryState('sort', parseAsString.withDefault('wpm'));
  const [sortDir, setSortDir] = useQueryState('order', parseAsString.withDefault('desc'));
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(10));

  const sorting: SortingState = useMemo(
    () => [{ id: sortColumn, desc: sortDir === 'desc' }],
    [sortColumn, sortDir]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('currentText', {
        id: 'currentText',
        header: 'Live Progress',
        enableSorting: false,
        cell: (info) => (
          <LiveProgressCell player={info.row.original} sentence={sentence} />
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Player Name',
        cell: (info) => (
          <span className="flex items-center gap-2">
            {info.getValue()}
            {info.row.original.id === currentPlayerId && (
              <span className="rounded-full bg-violet-700 px-1.5 py-0.5 text-[10px] font-semibold text-violet-100">
                YOU
              </span>
            )}
          </span>
        ),
      }),
      columnHelper.accessor('wpm', {
        header: 'WPM',
        cell: (info) => (
          <span className="tabular-nums font-mono font-semibold text-amber-300">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('accuracy', {
        header: 'Accuracy',
        cell: (info) => (
          <span className="tabular-nums font-mono">
            {formatAccuracy(info.getValue())}
          </span>
        ),
      }),
    ],
    [sentence, currentPlayerId]
  );

  const table = useReactTable({
    data: players,
    columns,
    state: {
      sorting,
      pagination: { pageIndex: page - 1, pageSize: pageSize ?? 10 },
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      if (next.length > 0) {
        setSortColumn(next[0].id);
        setSortDir(next[0].desc ? 'desc' : 'asc');
      } else {
        setSortColumn(null);
        setSortDir(null);
      }
      setPage(1);
    },
    onPaginationChange: (updater) => {
      const prev = { pageIndex: page - 1, pageSize: pageSize ?? 10 };
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setPage(next.pageIndex + 1);
      setPageSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  const SortIcon = ({ id }: { id: string }) => {
    if (sortColumn !== id) return <ChevronsUpDown className="ml-1 inline h-3 w-3 text-zinc-500" />;
    return sortDir === 'desc'
      ? <ChevronDown className="ml-1 inline h-3 w-3 text-violet-400" />
      : <ChevronUp className="ml-1 inline h-3 w-3 text-violet-400" />;
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-zinc-700">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-700 bg-zinc-800/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={[
                      'px-4 py-3 text-left font-semibold text-zinc-300',
                      header.column.getCanSort() ? 'cursor-pointer select-none hover:text-zinc-100' : '',
                    ].join(' ')}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && <SortIcon id={header.id} />}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  No players yet. Be the first to join!
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={[
                    'border-b border-zinc-800 transition-colors',
                    row.original.id === currentPlayerId ? 'bg-violet-950/30' : 'hover:bg-zinc-800/40',
                  ].join(' ')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-zinc-200">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize ?? 10}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {Math.max(1, table.getPageCount())}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
