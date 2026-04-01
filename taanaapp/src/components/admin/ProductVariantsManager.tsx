import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Variant {
  id?: string;
  size: string | null;
  color: string | null;
  stock: number;
  sku: string;
  price_modifier: number;
}

interface ProductVariantsManagerProps {
  productSizes: string[];
  productColors: string[];
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
}

const ProductVariantsManager = ({
  productSizes,
  productColors,
  variants,
  onVariantsChange,
}: ProductVariantsManagerProps) => {
  const [newVariant, setNewVariant] = useState<Variant>({
    size: null,
    color: null,
    stock: 0,
    sku: '',
    price_modifier: 0,
  });

  const handleAddVariant = () => {
    if (!newVariant.size && !newVariant.color) return;
    
    // Check if variant already exists
    const exists = variants.some(
      v => v.size === newVariant.size && v.color === newVariant.color
    );
    
    if (exists) return;
    
    onVariantsChange([...variants, { ...newVariant }]);
    setNewVariant({
      size: null,
      color: null,
      stock: 0,
      sku: '',
      price_modifier: 0,
    });
  };

  const handleRemoveVariant = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    onVariantsChange(updated);
  };

  const handleUpdateVariant = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onVariantsChange(updated);
  };

  const generateAllVariants = () => {
    const allVariants: Variant[] = [];
    
    if (productSizes.length === 0 && productColors.length === 0) return;
    
    if (productSizes.length === 0) {
      productColors.forEach(color => {
        allVariants.push({
          size: null,
          color,
          stock: 0,
          sku: `SKU-${color.toUpperCase().substring(0, 3)}`,
          price_modifier: 0,
        });
      });
    } else if (productColors.length === 0) {
      productSizes.forEach(size => {
        allVariants.push({
          size,
          color: null,
          stock: 0,
          sku: `SKU-${size}`,
          price_modifier: 0,
        });
      });
    } else {
      productSizes.forEach(size => {
        productColors.forEach(color => {
          allVariants.push({
            size,
            color,
            stock: 0,
            sku: `SKU-${size}-${color.toUpperCase().substring(0, 3)}`,
            price_modifier: 0,
          });
        });
      });
    }
    
    onVariantsChange(allVariants);
  };

  const totalVariantStock = variants.reduce((sum, v) => sum + v.stock, 0);

  if (productSizes.length === 0 && productColors.length === 0) {
    return (
      <div className="p-4 bg-muted/50 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          Add sizes or colors above to manage individual variant stock
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Variant Stock Management</Label>
          <p className="text-xs text-muted-foreground">
            Total stock across variants: <span className="font-semibold">{totalVariantStock}</span>
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={generateAllVariants}>
          Generate All Variants
        </Button>
      </div>

      {variants.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="text-xs">Size</TableHead>
                <TableHead className="text-xs">Color</TableHead>
                <TableHead className="text-xs">Stock</TableHead>
                <TableHead className="text-xs">SKU</TableHead>
                <TableHead className="text-xs">Price +/-</TableHead>
                <TableHead className="text-xs w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant, index) => (
                <TableRow key={index}>
                  <TableCell className="py-2">
                    <span className="text-sm">{variant.size || '-'}</span>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="text-sm">{variant.color || '-'}</span>
                  </TableCell>
                  <TableCell className="py-2">
                    <Input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => handleUpdateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                      className="h-8 w-20"
                    />
                  </TableCell>
                  <TableCell className="py-2">
                    <Input
                      value={variant.sku}
                      onChange={(e) => handleUpdateVariant(index, 'sku', e.target.value)}
                      className="h-8 w-32"
                      placeholder="SKU"
                    />
                  </TableCell>
                  <TableCell className="py-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={variant.price_modifier}
                      onChange={(e) => handleUpdateVariant(index, 'price_modifier', parseFloat(e.target.value) || 0)}
                      className="h-8 w-20"
                    />
                  </TableCell>
                  <TableCell className="py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVariant(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add new variant */}
      <div className="flex items-end gap-2 p-3 bg-muted/30 rounded-lg">
        {productSizes.length > 0 && (
          <div className="flex-1">
            <Label className="text-xs">Size</Label>
            <Select 
              value={newVariant.size || ''} 
              onValueChange={(v) => setNewVariant({ ...newVariant, size: v || null })}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {productSizes.map(size => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {productColors.length > 0 && (
          <div className="flex-1">
            <Label className="text-xs">Color</Label>
            <Select 
              value={newVariant.color || ''} 
              onValueChange={(v) => setNewVariant({ ...newVariant, color: v || null })}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {productColors.map(color => (
                  <SelectItem key={color} value={color}>{color}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="w-20">
          <Label className="text-xs">Stock</Label>
          <Input
            type="number"
            min="0"
            value={newVariant.stock}
            onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
            className="h-8"
          />
        </div>
        <Button type="button" size="sm" className="h-8" onClick={handleAddVariant}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProductVariantsManager;
