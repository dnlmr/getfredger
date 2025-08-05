'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Invoice } from '@/types';

const formatCurrency = (amount: number | null | undefined, currency: string) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency }).format(amount / 100);
};

const formatTaxRate = (taxRate: number | null | undefined) => {
    if (taxRate === null || taxRate === undefined) return '-';
    return `${taxRate / 100}%`;
};

const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'overdue':
            return 'destructive';
        default:
            return 'outline';
    }
};

export const columns: ColumnDef<Invoice>[] = [
    {
        accessorKey: 'invoice_number',
        header: 'Invoice',
        cell: ({ row }) => <div className="font-medium">{row.getValue('invoice_number')}</div>,
    },
    {
        accessorKey: 'invoice_title',
        header: 'Title',
        cell: ({ row }) => {
            const title = row.getValue('invoice_title') as string | null;
            return <div>{title || '-'}</div>;
        },
    },
    {
        accessorKey: 'sender_company_name',
        header: 'Sender',
        cell: ({ row }) => {
            const sender = row.getValue('sender_company_name') as string | null;
            return <div>{sender || '-'}</div>;
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
        },
    },
    {
        accessorKey: 'invoice_date',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Invoice Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue('invoice_date'));
            return <div>{date.toLocaleDateString()}</div>;
        },
    },
    {
        accessorKey: 'subtotal',
        header: () => <div className="text-right">Subtotal</div>,
        cell: ({ row }) => {
            const subtotal = row.getValue('subtotal') as number | null;
            const currency = row.original.currency;
            return <div className="text-right font-mono">{formatCurrency(subtotal, currency)}</div>;
        },
    },
    {
        accessorKey: 'tax_amount',
        header: () => <div className="text-right">Tax</div>,
        cell: ({ row }) => {
            const taxAmount = row.getValue('tax_amount') as number | null;
            const taxRate = row.original.tax_rate;
            const currency = row.original.currency;
            return (
                <div className="text-right font-mono">
                    {formatCurrency(taxAmount, currency)} ({formatTaxRate(taxRate)})
                </div>
            );
        },
    },
    {
        accessorKey: 'total',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="justify-end">
                    Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const total = row.getValue('total') as number;
            const currency = row.original.currency;
            return <div className="text-right font-mono font-medium">{formatCurrency(total, currency)}</div>;
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const invoice = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(invoice.invoice_number)}>Copy invoice number</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View invoice</DropdownMenuItem>
                        <DropdownMenuItem>Edit invoice</DropdownMenuItem>
                        <DropdownMenuItem>Download PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
