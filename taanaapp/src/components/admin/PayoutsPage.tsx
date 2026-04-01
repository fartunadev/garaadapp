import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Payout {
  id: string;
  seller_name: string;
  amount: number;
  payment_method: string | null;
  status: string;
  created_at: string;
  notes: string | null;
}

const PayoutsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payouts = [], isLoading } = useQuery({
    queryKey: ['payouts'],
    queryFn: async (): Promise<Payout[]> => {
      const res = await api.get('/payouts');
      return res.data?.data || [];
    },
  });

  const updatePayout = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/payouts/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      toast({ title: 'Payout updated' });
    },
  });

  const totalPayouts = payouts.reduce((s, p) => s + (p.amount || 0), 0);
  const pendingPayouts = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);
  const completedPayouts = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border">
      <div className="p-4 md:p-6 border-b border-border">
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">Seller Payouts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
            <p className="text-sm text-muted-foreground mb-1">Total Payouts</p>
            <p className="text-2xl font-bold text-foreground">${totalPayouts.toFixed(2)}</p>
          </div>
          <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-orange-600">${pendingPayouts.toFixed(2)}</p>
          </div>
          <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Completed</p>
            <p className="text-2xl font-bold text-foreground">${completedPayouts.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Seller</th>
              <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Amount</th>
              <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Method</th>
              <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Status</th>
              <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Date</th>
              <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="py-3 px-6"><Skeleton className="h-4 w-full" /></td></tr>
              ))
            ) : payouts.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No payouts found</td></tr>
            ) : (
              payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 md:px-6 font-medium text-foreground text-sm">{payout.seller_name || '—'}</td>
                  <td className="py-3 px-4 md:px-6 font-semibold text-foreground text-sm">${(payout.amount || 0).toFixed(2)}</td>
                  <td className="py-3 px-4 md:px-6 text-muted-foreground text-sm">{payout.payment_method || '—'}</td>
                  <td className="py-3 px-4 md:px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payout.status === 'completed' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                      payout.status === 'pending' ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20' :
                      payout.status === 'processing' ? 'bg-primary/10 text-primary border border-primary/20' :
                      'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 md:px-6 text-muted-foreground text-sm">
                    {new Date(payout.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 md:px-6">
                    {payout.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs"
                          onClick={() => updatePayout.mutate({ id: payout.id, status: 'processing' })}>
                          Process
                        </Button>
                        <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700"
                          onClick={() => updatePayout.mutate({ id: payout.id, status: 'completed' })}>
                          Approve
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayoutsPage;
