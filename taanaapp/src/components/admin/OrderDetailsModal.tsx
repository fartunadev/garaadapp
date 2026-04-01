import { useState, useEffect } from 'react';
import { X, CheckCircle, Truck, Package, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApproveOrder, useUpdatePaymentStatus, AdminOrder } from '@/hooks/useAdminOrders';
import { format } from 'date-fns';

interface OrderDetailsModalProps {
  order: AdminOrder | null;
  open: boolean;
  onClose: () => void;
}

const statusSteps = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'processing', label: 'Confirmed', icon: CheckCircle },
  { key: 'shipped', label: 'Shipping', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
];

const OrderDetailsModal = ({ order, open, onClose }: OrderDetailsModalProps) => {
  const [currentStatus, setCurrentStatus] = useState(order?.status || 'pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const approveOrder = useApproveOrder();
  const updatePaymentStatus = useUpdatePaymentStatus();

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status);
    }
  }, [order]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    
    setIsUpdating(true);
    try {
      await approveOrder.mutateAsync({ 
        orderId: order.id, 
        status: newStatus,
        customerEmail: order.customer?.email,
        customerName: order.customer?.full_name,
        orderNumber: order.order_number,
      });
      setCurrentStatus(newStatus);
      
      toast({
        title: 'Status Updated',
        description: `Order status changed to ${newStatus}. Customer notified via email.`,
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkPayment = async () => {
    if (!order) return;
    
    setIsUpdating(true);
    try {
      await updatePaymentStatus.mutateAsync({ 
        orderId: order.id, 
        paymentStatus: 'completed' 
      });
      toast({
        title: 'Payment Confirmed',
        description: 'Payment has been marked as completed.',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update payment status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return statusSteps.findIndex(s => s.key === status);
  };

  if (!open || !order) return null;

  const currentStatusIndex = getStatusIndex(currentStatus);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="sticky top-0 bg-primary text-primary-foreground p-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-bold">Order #{order.order_number.replace('ORD-', 'INV-')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Order Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground text-lg">Order Information</h3>
              
              <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number</span>
                  <span className="font-medium text-foreground">#{order.order_number.replace('ORD-', 'INV-')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="font-medium text-foreground">{format(new Date(order.created_at), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Customer</span>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{order.customer?.full_name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">
                      {[order.shipping_city, order.shipping_country].filter(Boolean).join(', ') || 'No address'}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium text-foreground">{order.payment_method || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.payment_status === 'completed' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-orange-500/10 text-orange-600'
                  }`}>
                    {order.payment_status || 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-foreground text-lg">${order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status:</label>
                <Select value={currentStatus} onValueChange={setCurrentStatus}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending (Processing)</SelectItem>
                    <SelectItem value="processing">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipping</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order Summary */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-foreground">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="text-foreground">${(order.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Total:</span>
                  <span className="font-bold text-foreground">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Items & Status */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground text-lg">Items Ordered</h3>
              
              {/* Status Progress */}
              <div className="flex items-center justify-between mb-4 bg-muted/30 rounded-lg p-4">
                {statusSteps.map((step, index) => {
                  const isActive = currentStatus !== 'cancelled' && index <= currentStatusIndex;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs mt-1 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground">Returned</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <img
                      src={item.product_image || '/placeholder.svg'}
                      alt={item.product_name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{item.product_name}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{item.quantity}x</p>
                      <p className="font-semibold text-foreground">${item.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-foreground">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="text-foreground">${(order.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Total:</span>
                  <span className="font-bold text-primary text-lg">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
            <Button 
              onClick={() => handleStatusUpdate('processing')}
              disabled={isUpdating}
              className="bg-primary hover:bg-primary/90"
            >
              Confirm
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('processing')}
              disabled={isUpdating}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              Confirm (Processing)
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('shipped')}
              disabled={isUpdating}
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10"
            >
              Mark as Shipped
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('delivered')}
              disabled={isUpdating}
              variant="outline"
              className="border-success text-success hover:bg-success/10"
            >
              Mark as Delivered
            </Button>
            <Button 
              onClick={handleMarkPayment}
              disabled={isUpdating || order.payment_status === 'completed'}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-600/10 gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Mark Payment
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={isUpdating}
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              Cancel Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
