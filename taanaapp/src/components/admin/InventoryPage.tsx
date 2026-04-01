import { useState } from "react";
import { Package, AlertTriangle, Save, Search, Filter, Loader2, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useProducts";
import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface StockUpdate {
  productId: string;
  newStock: number;
  currentStock: number;
}

const LOW_STOCK_THRESHOLD_DEFAULT = 10;

const getImageSrc = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '/placeholder.svg';
  if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) return imageUrl;
  return `/uploads/products/${imageUrl}`;
};

const InventoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [lowStockThreshold, setLowStockThreshold] = useState(LOW_STOCK_THRESHOLD_DEFAULT);
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: products, isLoading } = useProducts();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates: StockUpdate[]) => {
      for (const update of updates) {
        const diff = update.newStock - update.currentStock;
        if (diff !== 0) {
          await api.patch(`/products/${update.productId}/stock`, {
            quantity: Math.abs(diff),
            operation: diff > 0 ? 'increase' : 'decrease',
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setStockUpdates({});
      toast({ title: "Stock updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error.message || "Failed to update stock", variant: "destructive" });
    },
  });

  const handleStockChange = (productId: string, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setStockUpdates(prev => ({ ...prev, [productId]: numValue }));
  };

  const handleSaveChanges = async () => {
    const updates: StockUpdate[] = Object.entries(stockUpdates)
      .map(([productId, newStock]) => {
        const product = products?.find(p => String(p.id) === productId);
        return { productId, newStock, currentStock: product?.stock || 0 };
      })
      .filter(u => u.newStock !== u.currentStock);

    if (updates.length === 0) {
      toast({ title: "No changes to save" });
      return;
    }

    setIsSaving(true);
    await bulkUpdateMutation.mutateAsync(updates);
    setIsSaving(false);
  };

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product as any).category_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const stock = stockUpdates[String(product.id)] ?? product.stock;
    if (stockFilter === "low") return matchesSearch && stock <= lowStockThreshold && stock > 0;
    if (stockFilter === "out") return matchesSearch && stock === 0;
    if (stockFilter === "in") return matchesSearch && stock > lowStockThreshold;
    return matchesSearch;
  });

  const lowStockCount = products?.filter(p => p.stock <= lowStockThreshold && p.stock > 0).length || 0;
  const outOfStockCount = products?.filter(p => p.stock === 0).length || 0;
  const inStockCount = products?.filter(p => p.stock > lowStockThreshold).length || 0;
  const totalValue = products?.reduce((sum, p) => sum + (Number(p.price) * p.stock), 0) || 0;
  const hasChanges = Object.keys(stockUpdates).length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100 shrink-0">
              <Package className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{inStockCount}</p>
              <p className="text-xs text-muted-foreground">In Stock</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-100 shrink-0">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{lowStockCount}</p>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 shrink-0">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{outOfStockCount}</p>
              <p className="text-xs text-muted-foreground">Out of Stock</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10 shrink-0">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-muted-foreground">Inventory Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1 flex-1 min-w-32">
              <Label className="text-xs">Low Stock Threshold</Label>
              <Input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
                className="h-8 text-sm"
                min={0}
              />
            </div>
            <div className="space-y-1 flex-1 min-w-40">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1 min-w-36">
              <Label className="text-xs">Filter</Label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="h-8 text-sm">
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="in">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSaveChanges}
              disabled={!hasChanges || isSaving}
              size="sm"
              className="h-8"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
              Save {hasChanges ? `(${Object.keys(stockUpdates).length})` : ''}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Product Inventory
            <span className="text-sm font-normal text-muted-foreground ml-2">({filteredProducts?.length || 0} products)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs pl-4">Product</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs text-center">Current</TableHead>
                  <TableHead className="text-xs text-center">Update Stock</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Price</TableHead>
                  <TableHead className="text-xs">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.map((product) => {
                  const productId = String(product.id);
                  const displayStock = stockUpdates[productId] ?? product.stock;
                  const isLowStock = displayStock <= lowStockThreshold && displayStock > 0;
                  const isOutOfStock = displayStock === 0;
                  const hasChange = stockUpdates[productId] !== undefined && stockUpdates[productId] !== product.stock;
                  const categoryName = (product as any).category_name || product.category?.name;

                  return (
                    <TableRow key={product.id} className={hasChange ? "bg-primary/5" : ""}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={getImageSrc(product.image_url)}
                            alt={product.name}
                            className="h-8 w-8 rounded-md object-cover shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                          />
                          <p className="font-medium text-sm line-clamp-1 max-w-32">{product.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {categoryName || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold text-sm ${
                          product.stock === 0 ? 'text-red-600' :
                          product.stock <= lowStockThreshold ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={stockUpdates[productId] ?? product.stock}
                          onChange={(e) => handleStockChange(productId, e.target.value)}
                          className="w-20 h-7 text-sm text-center"
                          min={0}
                        />
                      </TableCell>
                      <TableCell>
                        {isOutOfStock ? (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Out</Badge>
                        ) : isLowStock ? (
                          <Badge className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0 border-0">Low</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0 border-0">OK</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">${Number(product.price).toFixed(2)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        ${(Number(product.price) * displayStock).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredProducts?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No products found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryPage;