import { useState } from 'react';
import { Eye, FileDown, Calendar, CheckCircle, XCircle, Truck, Package, Search, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import OrderDetailsModal from './OrderDetailsModal';
import { useAdminOrders, useApproveOrder, useUpdatePaymentStatus, AdminOrder } from '@/hooks/useAdminOrders';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const OrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: orders, isLoading } = useAdminOrders();
  const approveOrder = useApproveOrder();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const { toast } = useToast();

  const handleViewOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleApproveOrder = async (orderId: string, status: string, order?: AdminOrder) => {
    try {
      await approveOrder.mutateAsync({ 
        orderId, 
        status,
        customerEmail: order?.customer?.email,
        customerName: order?.customer?.full_name,
        orderNumber: order?.order_number,
      });
      
      toast({
        title: 'Order updated',
        description: `Order marked as ${status}. Customer notified via email.`,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update order',
        variant: 'destructive'
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order Number', 'Customer', 'Date', 'Status', 'Total', 'Payment Status'];
    const rows = filteredOrders.map((order) => [
      order.order_number,
      order.customer?.full_name || 'N/A',
      format(new Date(order.created_at), 'yyyy-MM-dd'),
      order.status,
      `$${order.total}`,
      order.payment_status
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Orders Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 14, 30);
    doc.text(`Total Orders: ${filteredOrders.length}`, 14, 36);
    
    const tableData = filteredOrders.map((order) => [
      order.order_number,
      order.customer?.full_name || 'N/A',
      format(new Date(order.created_at), 'yyyy-MM-dd'),
      order.status.charAt(0).toUpperCase() + order.status.slice(1),
      order.payment_status || 'N/A',
      `$${order.total.toFixed(2)}`,
    ]);
    
    autoTable(doc, {
      startY: 42,
      head: [['Order Number', 'Customer', 'Date', 'Status', 'Payment', 'Total']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [20, 184, 166] },
    });
    
    doc.save(`orders-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast({ title: 'PDF Downloaded', description: 'Orders report exported successfully' });
  };

  const exportToExcel = () => {
    const data = filteredOrders.map((order) => ({
      'Order Number': order.order_number,
      'Customer': order.customer?.full_name || 'N/A',
      'Email': order.customer?.email || 'N/A',
      'Phone': order.shipping_phone || order.customer?.phone || 'N/A',
      'Address': order.shipping_address || 'N/A',
      'City': order.shipping_city || 'N/A',
      'Country': order.shipping_country || 'N/A',
      'Date': format(new Date(order.created_at), 'yyyy-MM-dd HH:mm'),
      'Status': order.status.charAt(0).toUpperCase() + order.status.slice(1),
      'Payment Status': order.payment_status || 'N/A',
      'Payment Method': order.payment_method || 'N/A',
      'Subtotal': order.subtotal,
      'Shipping': order.shipping_cost || 0,
      'Tax': order.tax || 0,
      'Discount': order.discount || 0,
      'Total': order.total,
      'Items Count': order.order_items?.length || 0,
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `orders-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: 'Excel Downloaded', description: 'Orders report exported successfully' });
  };

  const filteredOrders = (orders || []).filter((order) => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    const orderDate = new Date(order.created_at);
    const matchesDateFrom = !dateFrom || orderDate >= dateFrom;
    const matchesDateTo = !dateTo || orderDate <= dateTo;
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Status counts
  const statusCounts = {
    pending: (orders || []).filter(o => o.status === 'pending').length,
    processing: (orders || []).filter(o => o.status === 'processing').length,
    shipped: (orders || []).filter(o => o.status === 'shipped').length,
    delivered: (orders || []).filter(o => o.status === 'delivered').length,
    cancelled: (orders || []).filter(o => o.status === 'cancelled').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-success/10 text-success border-success/20';
      case 'shipped': return 'bg-accent/10 text-accent border-accent/20';
      case 'processing': return 'bg-primary/10 text-primary border-primary/20';
      case 'pending': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-28" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-4" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
        >
          All Orders
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
        >
          Pending
          <Badge variant="secondary" className="ml-1 bg-orange-500/20 text-orange-600">{statusCounts.pending}</Badge>
        </Button>
        <Button
          variant={statusFilter === 'processing' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => { setStatusFilter('processing'); setCurrentPage(1); }}
        >
          Processing
          <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary">{statusCounts.processing}</Badge>
        </Button>
        <Button
          variant={statusFilter === 'shipped' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => { setStatusFilter('shipped'); setCurrentPage(1); }}
        >
          Shipped
          <Badge variant="secondary" className="ml-1 bg-accent/20 text-accent">{statusCounts.shipped}</Badge>
        </Button>
        <Button
          variant={statusFilter === 'delivered' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => { setStatusFilter('delivered'); setCurrentPage(1); }}
        >
          Delivered
          <Badge variant="secondary" className="ml-1 bg-success/20 text-success">{statusCounts.delivered}</Badge>
        </Button>
        <Button
          variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => { setStatusFilter('cancelled'); setCurrentPage(1); }}
        >
          Cancelled
          <Badge variant="secondary" className="ml-1 bg-destructive/20 text-destructive">{statusCounts.cancelled}</Badge>
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search by order number or customer..." 
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
              className="pl-10 bg-background border-border" 
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[140px] bg-background border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  {dateFrom ? format(dateFrom, 'MMM dd') : 'From'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  {dateTo ? format(dateTo, 'MMM dd') : 'To'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={exportToPDF} className="gap-2">
              <FileText className="w-4 h-4" />
              PDF
            </Button>
            <Button variant="outline" onClick={exportToExcel} className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-foreground">Order Management ({filteredOrders.length})</h2>
        </div>
        
        {paginatedOrders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Customer</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Order Date</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Total</th>
                  <th className="text-right py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 md:px-6 font-medium text-primary text-sm">
                      #{order.order_number.replace('ORD-', 'INV-')}
                    </td>
                    <td className="py-3 px-4 md:px-6">
                      <div className="text-sm">
                        <p className="font-medium text-foreground">{order.customer?.full_name || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 md:px-6 text-muted-foreground text-sm">
                      {format(new Date(order.created_at), 'dd MMM yyyy')}
                    </td>
                    <td className="py-3 px-4 md:px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 md:px-6 font-semibold text-foreground text-sm">${order.total.toFixed(2)}</td>
                    <td className="py-3 px-4 md:px-6 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="w-3 h-3" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <OrderDetailsModal 
        order={selectedOrder} 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </div>
  );
};

export default OrdersPage;
