import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { usePayments } from '@/hooks/useAdminData';
import { useUpdatePaymentStatus } from '@/hooks/useAdminOrders';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Search, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PaymentsPage = () => {
  const { data: payments, isLoading } = usePayments();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Calculate totals
  const totals = (payments || []).reduce((acc, payment) => {
    acc.total += payment.amount;
    if (payment.status === 'completed') acc.completed += payment.amount;
    else if (payment.status === 'pending') acc.pending += payment.amount;
    else if (payment.status === 'failed') acc.failed += payment.amount;
    return acc;
  }, { total: 0, completed: 0, pending: 0, failed: 0 });

  const filteredPayments = (payments || []).filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.order?.order_number?.toLowerCase().includes(searchLower) ||
      payment.transaction_id?.toLowerCase().includes(searchLower) ||
      payment.payment_method?.toLowerCase().includes(searchLower)
    );
  });

  const handleMarkAsCompleted = async (payment: any) => {
    try {
      await updatePaymentStatus.mutateAsync({
        orderId: payment.order_id,
        paymentStatus: 'completed'
      });
      toast({
        title: 'Payment Completed',
        description: `Payment for ${payment.order?.order_number} marked as completed.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update payment status',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsFailed = async (payment: any) => {
    try {
      await updatePaymentStatus.mutateAsync({
        orderId: payment.order_id,
        paymentStatus: 'failed'
      });
      toast({
        title: 'Payment Failed',
        description: `Payment for ${payment.order?.order_number} marked as failed.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update payment status',
        variant: 'destructive',
      });
    }
  };

  const viewPaymentDetails = (payment: any) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-4 md:p-6 border-b border-border">
          <Skeleton className="h-7 w-48 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="p-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full mb-4" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-4 md:p-6 border-b border-border">
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">Payment Transactions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">${totals.total.toFixed(2)}</p>
            </div>
            <div className="bg-success/10 p-4 rounded-xl border border-success/20">
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <p className="text-2xl font-bold text-success">${totals.completed.toFixed(2)}</p>
            </div>
            <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-2xl font-bold text-orange-600">${totals.pending.toFixed(2)}</p>
            </div>
            <div className="bg-destructive/10 p-4 rounded-xl border border-destructive/20">
              <p className="text-sm text-muted-foreground mb-1">Failed</p>
              <p className="text-2xl font-bold text-destructive">${totals.failed.toFixed(2)}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by order number, transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </div>
        
        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Order</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Transaction ID</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Amount</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Method</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Date</th>
                  <th className="text-right py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 md:px-6 font-medium text-primary text-sm">
                      {payment.order?.order_number || '-'}
                    </td>
                    <td className="py-3 px-4 md:px-6 text-muted-foreground text-sm font-mono">
                      {payment.transaction_id || '-'}
                    </td>
                    <td className="py-3 px-4 md:px-6 font-semibold text-foreground text-sm">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 md:px-6 text-muted-foreground text-sm capitalize">
                      {payment.payment_method}
                    </td>
                    <td className="py-3 px-4 md:px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed' ? 'bg-success/10 text-success border border-success/20' :
                        payment.status === 'pending' ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20' :
                        'bg-destructive/10 text-destructive border border-destructive/20'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 md:px-6 text-muted-foreground text-sm">
                      {format(new Date(payment.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4 md:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewPaymentDetails(payment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {payment.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-success hover:text-success"
                              onClick={() => handleMarkAsCompleted(payment)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleMarkAsFailed(payment)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-medium text-primary">{selectedPayment.order?.order_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm">{selectedPayment.transaction_id || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-bold text-lg">${selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="capitalize">{selectedPayment.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={
                    selectedPayment.status === 'completed' ? 'default' :
                    selectedPayment.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {selectedPayment.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{format(new Date(selectedPayment.created_at), 'MMM d, yyyy HH:mm')}</p>
                </div>
              </div>

              {selectedPayment.order && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Order Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Order Status:</span>
                      <span className="ml-2 capitalize">{selectedPayment.order.status}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Order Total:</span>
                      <span className="ml-2">${selectedPayment.order.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedPayment.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={() => {
                      handleMarkAsCompleted(selectedPayment);
                      setDetailsOpen(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Completed
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleMarkAsFailed(selectedPayment);
                      setDetailsOpen(false);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Mark Failed
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsPage;
