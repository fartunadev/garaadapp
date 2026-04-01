import { useState } from 'react';
import { TrendingUp, ShoppingCart, Users, Package, Download, FileSpreadsheet, FileText, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrders, useProfiles } from '@/hooks/useAdminData';
import { useProducts } from '@/hooks/useProducts';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ReportsPage = () => {
  const [reportPeriod, setReportPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [selectedYear, setSelectedYear] = useState(() => format(new Date(), 'yyyy'));

  const { data: orders } = useOrders();
  const { data: profiles } = useProfiles();
  const { data: products } = useProducts();

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return { value: format(date, 'yyyy-MM'), label: format(date, 'MMMM yyyy') };
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  const getFilteredOrders = () => {
    if (!orders) return [];
    let start: Date, end: Date;
    if (reportPeriod === 'monthly') {
      const [year, month] = selectedMonth.split('-').map(Number);
      start = startOfMonth(new Date(year, month - 1));
      end = endOfMonth(new Date(year, month - 1));
    } else {
      start = startOfYear(new Date(parseInt(selectedYear), 0));
      end = endOfYear(new Date(parseInt(selectedYear), 0));
    }
    return orders.filter(order => {
      try {
        return isWithinInterval(parseISO(order.created_at), { start, end });
      } catch { return false; }
    });
  };

  const filteredOrders = getFilteredOrders();
  const totalSales = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter(o => o.status === 'delivered').length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const generateChartData = () => {
    if (!filteredOrders.length) return [];
    const groupedData: { [key: string]: { sales: number; orders: number } } = {};
    filteredOrders.forEach(order => {
      const key = reportPeriod === 'monthly'
        ? format(parseISO(order.created_at), 'dd')
        : format(parseISO(order.created_at), 'MMM');
      if (!groupedData[key]) groupedData[key] = { sales: 0, orders: 0 };
      groupedData[key].sales += order.total;
      groupedData[key].orders += 1;
    });
    return Object.entries(groupedData)
      .map(([period, data]) => ({ period, ...data }))
      .sort((a, b) => a.period.localeCompare(b.period));
  };

  const chartData = generateChartData();

  const categoryDistribution = (() => {
    const statusCounts: Record<string, number> = {};
    filteredOrders.forEach(order => {
      const status = order.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    const colors = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return Object.entries(statusCounts).map(([name, value], i) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[i % colors.length],
    }));
  })();

  const periodLabel = reportPeriod === 'monthly'
    ? format(parseISO(selectedMonth + '-01'), 'MMMM yyyy')
    : selectedYear;

  const generateTableData = () => filteredOrders.map(order => ({
    'Order Number': order.order_number,
    'Date': format(parseISO(order.created_at), 'MMM d, yyyy'),
    'Status': order.status,
    'Payment Status': order.payment_status || 'Pending',
    'Subtotal': `$${order.subtotal.toFixed(2)}`,
    'Tax': `$${(order.tax || 0).toFixed(2)}`,
    'Total': `$${order.total.toFixed(2)}`,
  }));

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableData = generateTableData();
    doc.setFontSize(20);
    doc.text(`Sales Report - ${periodLabel}`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Total Sales: $${totalSales.toFixed(2)}`, 14, 35);
    doc.text(`Total Orders: ${totalOrders}`, 14, 42);
    doc.text(`Completed: ${completedOrders}`, 14, 49);
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, 14, 56);
    autoTable(doc, {
      head: [Object.keys(tableData[0] || {})],
      body: tableData.map(Object.values),
      startY: 65,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [21, 97, 109] },
    });
    doc.save(`sales-report-${periodLabel.replace(' ', '-').toLowerCase()}.pdf`);
  };

  const exportToExcel = () => {
    const tableData = generateTableData();
    const summaryData = [
      { 'Order Number': `Sales Report - ${periodLabel}` },
      { 'Order Number': `Total Sales: $${totalSales.toFixed(2)}` },
      { 'Order Number': `Total Orders: ${totalOrders}` },
      { 'Order Number': '' },
    ];
    const ws = XLSX.utils.json_to_sheet([...summaryData, ...tableData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
    XLSX.writeFile(wb, `sales-report-${periodLabel.replace(' ', '-').toLowerCase()}.xlsx`);
  };

  const statCards = [
    {
      label: 'Total Revenue',
      value: `$${totalSales.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
      iconColor: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      trend: '+12%', up: true,
    },
    {
      label: 'Total Orders',
      value: String(totalOrders),
      icon: ShoppingCart,
      color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
      iconColor: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      trend: `${completedOrders} delivered`, up: true,
    },
    {
      label: 'Avg Order Value',
      value: `$${avgOrderValue.toFixed(2)}`,
      icon: Users,
      color: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800',
      iconColor: 'bg-gradient-to-br from-violet-500 to-purple-600',
      trend: 'Per order', up: true,
    },
    {
      label: 'Products',
      value: String(products?.length || 0),
      icon: Package,
      color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
      iconColor: 'bg-gradient-to-br from-orange-500 to-amber-600',
      trend: `${profiles?.length || 0} customers`, up: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">Sales performance for {periodLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={reportPeriod} onValueChange={(v: 'monthly' | 'yearly') => setReportPeriod(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {reportPeriod === 'monthly' ? (
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-44">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" onClick={exportToPDF} className="gap-2 h-9">
            <FileText className="w-4 h-4" /> PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel} className="gap-2 h-9">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className={`rounded-2xl border p-5 ${stat.color}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.iconColor} rounded-xl p-2.5 shadow`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {stat.up ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
              <span className="text-xs text-muted-foreground">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="xl:col-span-2 bg-card rounded-2xl border border-border p-5">
          <h3 className="text-base font-bold text-foreground mb-4">Revenue Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: 12 }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revGrad)" name="Revenue ($)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">No data for selected period</div>
          )}
        </div>

        {/* Pie Chart */}
        {categoryDistribution.length > 0 ? (
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-base font-bold text-foreground mb-4">Orders by Status</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {categoryDistribution.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-5 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No order data</p>
          </div>
        )}
      </div>

      {/* Order Volume Bar Chart */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="text-base font-bold text-foreground mb-4">Order Volume</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: 12 }} />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">No data for selected period</div>
        )}
      </div>

      {/* Orders Data Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-foreground">Orders Data Table</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{filteredOrders.length} records for {periodLabel}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={exportToPDF} className="gap-1.5 h-8 text-xs">
              <FileText className="w-3.5 h-3.5" /> PDF
            </Button>
            <Button size="sm" variant="outline" onClick={exportToExcel} className="gap-1.5 h-8 text-xs">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order #</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subtotal</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tax</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.slice(0, 20).map((order) => (
                <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-primary text-xs">{order.order_number}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {format(parseISO(order.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                      order.payment_status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-950/50'
                    }`}>
                      {order.payment_status || 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-muted-foreground">${order.subtotal.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-xs text-muted-foreground">${(order.tax || 0).toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-xs font-bold text-foreground">${order.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            {filteredOrders.length > 0 && (
              <tfoot className="bg-muted/50">
                <tr className="border-t border-border">
                  <td colSpan={4} className="py-3 px-4 text-xs font-bold text-foreground">Totals</td>
                  <td className="py-3 px-4 text-right text-xs font-bold text-foreground">
                    ${filteredOrders.reduce((s, o) => s + o.subtotal, 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-xs font-bold text-foreground">
                    ${filteredOrders.reduce((s, o) => s + (o.tax || 0), 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-xs font-bold text-primary">
                    ${totalSales.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No orders found for the selected period</p>
            <p className="text-xs mt-1">Try selecting a different month or year</p>
          </div>
        )}
        {filteredOrders.length > 20 && (
          <div className="p-4 border-t border-border text-center text-xs text-muted-foreground">
            Showing 20 of {filteredOrders.length} orders. Export to see all records.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
