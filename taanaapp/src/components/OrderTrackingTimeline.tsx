import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { format } from 'date-fns';
import { Package, Clock, Truck, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';

interface StatusHistoryEntry {
  id: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; icon: React.ComponentType<any>; color: string }> = {
  pending: { label: 'Order Placed', icon: Clock, color: 'text-yellow-600' },
  processing: { label: 'Processing', icon: Package, color: 'text-blue-600' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'text-emerald-600' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600' },
  delivered: { label: 'Delivered', icon: ShoppingBag, color: 'text-green-600' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-600' },
};

interface OrderTrackingTimelineProps {
  orderId: string;
  currentStatus: string;
}

export const OrderTrackingTimeline = ({ orderId, currentStatus }: OrderTrackingTimelineProps) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['order-status-history', orderId],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`);
      const order = res.data?.data || res.data;
      return (order?.order_status_history || []) as StatusHistoryEntry[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // If no history, show current status only
  if (!history || history.length === 0) {
    const config = statusConfig[currentStatus] || statusConfig.pending;
    const StatusIcon = config.icon;
    
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 ${config.color}`}>
            <StatusIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-sm">{config.label}</p>
            <p className="text-xs text-muted-foreground">Current status</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {history.map((entry, index) => {
        const config = statusConfig[entry.status] || statusConfig.pending;
        const StatusIcon = config.icon;
        const isLast = index === history.length - 1;
        
        return (
          <div key={entry.id} className="flex items-start gap-3 relative">
            {/* Vertical line connecting steps */}
            {!isLast && (
              <div className="absolute left-4 top-8 w-0.5 h-full bg-border -translate-x-1/2" />
            )}
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
              isLast ? 'bg-primary text-primary-foreground' : 'bg-muted'
            } ${isLast ? '' : config.color}`}>
              <StatusIcon className="w-4 h-4" />
            </div>
            
            <div className="flex-1 pb-6">
              <p className={`font-medium text-sm ${isLast ? 'text-primary' : 'text-foreground'}`}>
                {config.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
              {entry.notes && (
                <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
