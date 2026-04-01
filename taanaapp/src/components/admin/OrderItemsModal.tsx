import { X, Package } from 'lucide-react';
import { AdminOrderItem } from '@/hooks/useAdminOrders';

interface OrderItemsModalProps {
  items: AdminOrderItem[];
  orderNumber: string;
  open: boolean;
  onClose: () => void;
}

const OrderItemsModal = ({ items, orderNumber, open, onClose }: OrderItemsModalProps) => {
  if (!open) return null;

  const total = items.reduce((sum, item) => sum + Number(item.total), 0);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-foreground">Order Items</h2>
              <p className="text-sm text-muted-foreground">{orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-foreground">Product</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-foreground">Qty</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-foreground">Size</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-foreground">Color</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-foreground">Price</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product_image || '/placeholder.svg'}
                          alt={item.product_name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <span className="font-medium text-foreground text-sm truncate max-w-[150px]">
                          {item.product_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-muted-foreground text-sm">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.size ? (
                        <span className="text-xs bg-muted px-2 py-1 rounded">{item.size}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.color ? (
                        <span className="text-xs bg-muted px-2 py-1 rounded">{item.color}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground text-sm">
                      ${item.price}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-foreground text-sm">
                      ${item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{items.length} item(s)</span>
            <div className="text-right">
              <span className="text-sm text-muted-foreground mr-2">Total:</span>
              <span className="text-lg font-bold text-foreground">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItemsModal;
