import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { invoiceService } from '@/services/invoiceService';
import httpClient from '@/api/httpClient';
import { Invoice, InvoiceStatus } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AIEmailDrafter from '@/components/ai/AIEmailDrafter';
import { useAuth } from '@/hooks/useAuth';

const statusVariant: Record<InvoiceStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  DRAFT: 'default' as 'info',
  SENT: 'info',
  PAID: 'success',
  OVERDUE: 'danger',
};

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (!id) return;
    invoiceService.getById(id).then(({ data }) => {
      if (data.IsSuccess && data.Data) setInvoice(data.Data);
    });
  }, [id]);

  const updateStatus = async (status: InvoiceStatus) => {
    if (!id) return;
    const payload: Record<string, unknown> = { status };
    if (status === 'PAID') payload.paidDate = new Date().toISOString();
    await invoiceService.update(id, payload as Partial<Invoice>);
    invoiceService.getById(id).then(({ data }) => {
      if (data.IsSuccess && data.Data) setInvoice(data.Data);
    });
  };

  const downloadPDF = async () => {
    if (!id) return;
    try {
      const response = await httpClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoice?.invoiceNumber || 'invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // handled
    }
  };

  if (!invoice) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/invoices" className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeftIcon className="h-5 w-5 text-gray-500" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
          <Badge variant={statusVariant[invoice.status]}>{invoice.status}</Badge>
        </div>
        <div className="flex gap-2">
          {invoice.status === 'OVERDUE' && invoice.client && (
            <AIEmailDrafter
              context={{
                type: 'overdue_invoice',
                clientName: invoice.client.name,
                amount: Number(invoice.total),
                daysOverdue: Math.max(0, Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))),
                businessName: user?.businessName || user?.name,
              }}
              label="Draft Reminder"
            />
          )}
          {invoice.status === 'DRAFT' && <Button variant="secondary" onClick={() => updateStatus('SENT')}>Mark Sent</Button>}
          {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && <Button onClick={() => updateStatus('PAID')}>Mark Paid</Button>}
          <Button variant="ghost" onClick={downloadPDF}><ArrowDownTrayIcon className="h-4 w-4 mr-1" /> PDF</Button>
          <Button variant="ghost" onClick={() => window.print()}><PrinterIcon className="h-4 w-4 mr-1" /> Print</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 print:shadow-none print:border-none">
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Invoice</h2>
            <p className="text-sm text-gray-500 mt-1">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
            <p>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            {invoice.paidDate && <p>Paid: {new Date(invoice.paidDate).toLocaleDateString()}</p>}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Bill To</h3>
          <p className="font-medium text-gray-900">{invoice.client?.name}</p>
          {invoice.client?.email && <p className="text-sm text-gray-600">{invoice.client.email}</p>}
          {invoice.client?.address && <p className="text-sm text-gray-600">{invoice.client.address}</p>}
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-sm font-medium text-gray-500 pb-2">Description</th>
              <th className="text-right text-sm font-medium text-gray-500 pb-2">Qty</th>
              <th className="text-right text-sm font-medium text-gray-500 pb-2">Unit Price</th>
              <th className="text-right text-sm font-medium text-gray-500 pb-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 text-sm text-gray-900">{item.description}</td>
                <td className="py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                <td className="py-3 text-sm text-gray-900 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                <td className="py-3 text-sm text-gray-900 text-right">${Number(item.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">${Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax ({Number(invoice.taxRate)}%)</span>
              <span className="text-gray-900">${Number(invoice.taxAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">${Number(invoice.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
            <p className="text-sm text-gray-700">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
