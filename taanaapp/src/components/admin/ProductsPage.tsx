
import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Star, Search, Download, FileSpreadsheet, ChevronLeft, ChevronRight, Calendar, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductForm from './ProductForm';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

const ITEMS_PER_PAGE = 24;

const ProductsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<'all' | 'monthly' | 'yearly'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();

  // Filter products based on search, category, and date
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        (p as any).category_name?.toLowerCase().includes(query) ||
        p.category?.name?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((product) => String(product.category_id) === categoryFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const start = dateFilter === 'monthly' ? startOfMonth(now) : startOfYear(now);
      const end = dateFilter === 'monthly' ? endOfMonth(now) : endOfYear(now);
      filtered = filtered.filter((p) => isWithinInterval(new Date(p.created_at), { start, end }));
    }
    return filtered;
  }, [products, searchQuery, categoryFilter, dateFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Delete this product?')) {
      try {
        await deleteProduct.mutateAsync(id);
        toast({ title: 'Product deleted' });
      } catch {
        toast({ title: 'Failed to delete', variant: 'destructive' });
      }
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Products Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'PPP')}`, 14, 22);
    doc.text(`Total: ${filteredProducts.length}`, 14, 28);
    autoTable(doc, {
      startY: 34,
      head: [['Name', 'Price', 'Stock', 'Category', 'Status', 'Created']],
      body: filteredProducts.map((p) => [
        p.name,
        `$${Number(p.price).toFixed(2)}`,
        p.stock.toString(),
        (p as any).category_name || p.category?.name || 'N/A',
        p.is_flash_deal ? 'Flash' : p.is_trending ? 'Trending' : 'Regular',
        format(new Date(p.created_at), 'PP'),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    doc.save(`products-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast({ title: 'PDF exported' });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredProducts.map((p) => ({
      Name: p.name,
      Price: Number(p.price),
      Stock: p.stock,
      Category: (p as any).category_name || p.category?.name || 'N/A',
      'Flash Deal': p.is_flash_deal ? 'Yes' : 'No',
      Trending: p.is_trending ? 'Yes' : 'No',
      'Discount %': p.discount_percent || 0,
      Created: format(new Date(p.created_at), 'PP'),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, `products-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: 'Excel exported' });
  };

  const getImageSrc = (imageUrl: string | null) => {
    if (!imageUrl) return '/placeholder.svg';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) return imageUrl;
    return `/uploads/products/${imageUrl}`;
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-1.5">
                <Skeleton className="h-3 w-3/4 mb-1" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-4 border-b border-border">
          {/* Header */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-foreground">
                Products ({filteredProducts.length})
              </h2>
              <Button size="sm" onClick={() => { setEditingProduct(null); setShowForm(true); }} className="h-8 text-xs gap-1.5">
                <Plus className="w-3.5 h-3.5" />Add Product
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-9 h-8 text-sm"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-full sm:w-44">
                  <Grid className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {(categories || []).map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={(value: any) => { setDateFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-full sm:w-36 h-8 text-xs">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="yearly">This Year</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={exportToPDF}>
                  <Download className="h-3.5 w-3.5 mr-1" />PDF
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={exportToExcel}>
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />Excel
                </Button>
              </div>
            </div>
          </div>

          {paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-all group bg-card">
                    {/* Image */}
                    <div className="relative bg-muted aspect-square">
                      <img
                        src={getImageSrc(product.image_url)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
                      {/* Badges */}
                      {product.is_flash_deal && (
                        <span className="absolute top-1 left-1 px-1 py-0.5 rounded text-[9px] font-bold text-white bg-orange-500">FLASH</span>
                      )}
                      {!product.is_flash_deal && product.is_trending && (
                        <span className="absolute top-1 left-1 px-1 py-0.5 rounded text-[9px] font-bold text-white bg-green-500">TREND</span>
                      )}
                      {product.discount_percent > 0 && (
                        <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground px-1 py-0.5 rounded text-[9px] font-bold">
                          -{product.discount_percent}%
                        </span>
                      )}
                      {/* Hover actions */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => { setEditingProduct(product); setShowForm(true); }}
                          className="p-1 bg-white rounded-md shadow-sm hover:bg-primary/10"
                        >
                          <Edit className="w-3 h-3 text-primary" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1 bg-white rounded-md shadow-sm hover:bg-destructive/10"
                          disabled={deleteProduct.isPending}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-1.5">
                      <p className="font-medium text-foreground text-[11px] leading-tight line-clamp-2 mb-0.5">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate mb-0.5">
                        {(product as any).category_name || product.category?.name || '—'}
                      </p>
                      <div className="flex items-center gap-0.5 mb-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-2 h-2 ${i < Math.floor(Number(product.rating) || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                        ))}
                        <span className="text-[9px] text-muted-foreground ml-0.5">({product.reviews_count || 0})</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-bold text-foreground">${Number(product.price).toFixed(2)}</span>
                        {product.original_price && (
                          <span className="text-[9px] text-muted-foreground line-through">${Number(product.original_price).toFixed(2)}</span>
                        )}
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Stock: {product.stock}</p>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-xs font-medium">{currentPage}/{totalPages}</span>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-sm mb-3">
                {searchQuery ? 'No products found.' : 'No products yet.'}
              </p>
              {!searchQuery && (
                <Button size="sm" onClick={() => { setEditingProduct(null); setShowForm(true); }}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />Add Product
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <ProductForm product={editingProduct} onClose={() => { setShowForm(false); setEditingProduct(null); }} />
      )}
    </>
  );
};

export default ProductsPage;