import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, ArrowUpRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useOrders, useProfiles } from '@/hooks/useAdminData';
import { useProducts } from '@/hooks/useProducts';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, subMonths } from 'date-fns';

interface DashboardStatsProps {
  currentRole: string;
}

const DashboardStats = ({ currentRole }: DashboardStatsProps) => {
  const { data: orders } = useOrders();
  const { data: profiles } = useProfiles();
  const { data: products } = useProducts();

  const totalSales = (orders || []).reduce((sum, o) => sum + o.total, 0);
  const totalOrders = (orders || []).length;
  const totalCustomers = (profiles || []).length;
  const totalProducts = (products || []).length;

  const pendingOrders = (orders || []).filter(o => o.status === 'pending').length;
  const completedOrders = (orders || []).filter(o => o.status === 'delivered').length;
  const processingOrders = (orders || []).filter(o => o.status === 'processing' || o.status === 'shipped').length;

  // Last 6 months chart data
  const chartData = (() => {
    const monthsData: { month: string; sales: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, 'yyyy-MM');
      const label = format(date, 'MMM');
      const monthOrders = (orders || []).filter(o => {
        try { return format(parseISO(o.created_at), 'yyyy-MM') === monthKey; } catch { return false; }
      });
      monthsData.push({
        month: label,
        sales: monthOrders.reduce((sum, o) => sum + o.total, 0),
        orders: monthOrders.length,
      });
    }
    return monthsData;
  })();

  // Order status distribution
  const statusData = (() => {
    const counts: Record<string, number> = {};
    (orders || []).forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', '#f59e0b', '#ef4444', '#8b5cf6'];
    return Object.entries(counts).map(([name, value], i) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[i % colors.length],
    }));
  })();

  // Recent orders
  const recentOrders = (orders || [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Low stock products
  const lowStockProducts = (products || [])
    .filter(p => p.stock > 0 && p.stock <= 5)
    .slice(0, 4);

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${totalSales.toFixed(2)}`,
      sub: `${totalOrders} orders`,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      trend: '+12%',
      up: true,
    },
    {
      label: 'Total Orders',
      value: String(totalOrders),
      sub: `${pendingOrders} pending`,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      trend: '+8%',
      up: true,
    },
    {
      label: 'Customers',
      value: String(totalCustomers),
      sub: 'Registered users',
      icon: Users,
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
      border: 'border-violet-200 dark:border-violet-800',
      iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
      trend: '+5%',
      up: true,
    },
    {
      label: 'Products',
      value: String(totalProducts),
      sub: `${lowStockProducts.length} low stock`,
      icon: Package,
      gradient: 'from-orange-500 to-amber-600',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      border: 'border-orange-200 dark:border-orange-800',
      iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600',
      trend: lowStockProducts.length > 0 ? `-${lowStockProducts.length}` : '0',
      up: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl border ${stat.border} ${stat.bg} p-5`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
              </div>
              <div className={`${stat.iconBg} rounded-xl p-2.5 shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {stat.up ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-orange-500" />
              )}
              <span className={`text-xs font-semibold ${stat.up ? 'text-emerald-600' : 'text-orange-600'}`}>
                {stat.trend}
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Order Status Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-950/40 rounded-lg">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg font-bold text-foreground">{pendingOrders}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-950/40 rounded-lg">
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Processing</p>
            <p className="text-lg font-bold text-foreground">{processingOrders}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 rounded-lg">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Delivered</p>
            <p className="text-lg font-bold text-foreground">{completedOrders}</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Area Chart */}
        <div className="xl:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-foreground">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> Live Data
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: 12 }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#salesGrad)" name="Revenue ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="font-bold text-foreground">Orders by Status</h3>
            <p className="text-xs text-muted-foreground">All time</p>
          </div>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No order data</div>
          )}
        </div>
      </div>

      {/* Orders Bar Chart + Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="font-bold text-foreground">Order Volume</h3>
            <p className="text-xs text-muted-foreground">Monthly order count</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: 12 }}
              />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-foreground">Recent Orders</h3>
              <p className="text-xs text-muted-foreground">Latest transactions</p>
            </div>
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{order.order_number}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(parseISO(order.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground">${order.total.toFixed(2)}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-950/50'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No orders yet</div>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-amber-800 dark:text-amber-400">Low Stock Alert</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="bg-white dark:bg-amber-950/30 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                <p className="text-lg font-bold text-amber-600 mt-1">{p.stock}</p>
                <p className="text-[10px] text-muted-foreground">units left</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
