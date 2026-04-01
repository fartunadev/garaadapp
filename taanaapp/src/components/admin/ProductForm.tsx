import { useState, useEffect } from 'react';

// Decode HTML entities injected by old XSS sanitizer (e.g. &#x2F; → /)
const decodeUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  return url.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
};
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCategories, useSubcategories } from '@/hooks/useCategories';
import { useCreateProduct, useUpdateProduct, uploadProductImage, useAddProductImage, useDeleteProductImage, useProductImages, ProductImage } from '@/hooks/useProducts';
import { useProductVariants, useBulkCreateVariants } from '@/hooks/useProductVariants';
import ProductVariantsManager from './ProductVariantsManager';

interface ProductFormProps {
  product?: any;
  onClose: () => void;
  sellerId?: string;
}

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
const PRESET_COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Navy', 'Gray', 'Brown', 'Orange'];

const ProductForm = ({ product, onClose, sellerId }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category_id: product?.category_id ? String(product.category_id) : '',
    subcategory_id: product?.subcategory_id ? String(product.subcategory_id) : '',
    price: product?.price?.toString() || '',
    original_price: product?.original_price?.toString() || '',
    stock: product?.stock?.toString() || '',
    discount_percent: product?.discount_percent?.toString() || '0',
    is_flash_deal: product?.is_flash_deal || false,
    is_trending: product?.is_trending || false,
    sizes: Array.isArray(product?.sizes) ? product.sizes
      : (typeof product?.sizes === 'string' && product.sizes ? product.sizes.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
    colors: Array.isArray(product?.colors) ? product.colors
      : (typeof product?.colors === 'string' && product.colors ? product.colors.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
    imageFile: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string>(decodeUrl(product?.image_url));
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>(product?.product_images || []);
  const [customSize, setCustomSize] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load gallery images when editing an existing product
  const { data: fetchedImages } = useProductImages(product?.id?.toString() || '');
  const [variants, setVariants] = useState<Array<{
    id?: string;
    size: string | null;
    color: string | null;
    stock: number;
    sku: string;
    price_modifier: number;
  }>>([]);
  
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const { data: subcategories } = useSubcategories(formData.category_id || undefined);
  const { data: existingVariants } = useProductVariants(product?.id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const addProductImage = useAddProductImage();
  const deleteProductImage = useDeleteProductImage();
  const bulkCreateVariants = useBulkCreateVariants();

  // Load existing gallery images when editing
  useEffect(() => {
    if (fetchedImages && fetchedImages.length > 0) {
      setExistingImages(fetchedImages);
    }
  }, [fetchedImages]);

  // Load existing variants when editing
  useEffect(() => {
    if (existingVariants && existingVariants.length > 0) {
      setVariants(existingVariants.map(v => ({
        id: v.id,
        size: v.size,
        color: v.color,
        stock: v.stock,
        sku: v.sku || '',
        price_modifier: v.price_modifier || 0,
      })));
    }
  }, [existingVariants]);

  // Reset subcategory when category changes
  useEffect(() => {
    if (!product) {
      setFormData(prev => ({ ...prev, subcategory_id: '' }));
    }
  }, [formData.category_id, product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Image must be less than 5MB', variant: 'destructive' });
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast({ title: 'Invalid file type', description: 'Only JPG and PNG files are allowed', variant: 'destructive' });
        return;
      }
      setFormData({ ...formData, imageFile: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const previews: string[] = [];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: `${file.name} exceeds 5MB`, variant: 'destructive' });
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast({ title: 'Invalid file type', description: `${file.name} is not JPG or PNG`, variant: 'destructive' });
        return;
      }
      validFiles.push(file);
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === validFiles.length) {
          setAdditionalImages(prev => [...prev, ...validFiles]);
          setAdditionalPreviews(prev => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    try {
      await deleteProductImage.mutateAsync(imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast({ title: 'Image removed' });
    } catch {
      toast({ title: 'Failed to remove image', variant: 'destructive' });
    }
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const addCustomSize = () => {
    if (customSize.trim() && !formData.sizes.includes(customSize.trim())) {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, customSize.trim()] }));
      setCustomSize('');
    }
  };

  const toggleColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color],
    }));
  };

  const addCustomColor = () => {
    if (customColor.trim() && !formData.colors.includes(customColor.trim())) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, customColor.trim()] }));
      setCustomColor('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = decodeUrl(product?.image_url) || null;

      // Upload main image if new file selected
      if (formData.imageFile) {
        imageUrl = await uploadProductImage(formData.imageFile);
      }

      const productData: any = {
        name: formData.name,
        description: formData.description || null,
        categoryId: formData.category_id || null,
        subcategoryId: formData.subcategory_id || null,
        price: parseFloat(formData.price),
        originalPrice: formData.original_price ? parseFloat(formData.original_price) : null,
        stock: parseInt(formData.stock) || 0,
        discountPercent: parseInt(formData.discount_percent) || 0,
        isFlashDeal: !!formData.is_flash_deal,
        isTrending: !!formData.is_trending,
        sizes: formData.sizes,
        colors: formData.colors,
        imageUrl,
      };

      // Auto-set sellerId for sellers
      if (sellerId && !product) {
        productData.sellerId = sellerId;
      }

      let productId = product?.id;

      if (product) {
        await updateProduct.mutateAsync({ id: product.id, ...productData });
      } else {
        const newProduct = await createProduct.mutateAsync(productData);
        productId = newProduct.id;
      }

      // Upload additional images
      if (additionalImages.length > 0 && productId) {
        for (let i = 0; i < additionalImages.length; i++) {
          const imageUrl = await uploadProductImage(additionalImages[i]);
          await addProductImage.mutateAsync({
            productId,
            imageUrl,
            sortOrder: existingImages.length + i + 1,
          });
        }
      }

      // Save product variants
      if (variants.length > 0 && productId) {
        await bulkCreateVariants.mutateAsync({
          productId,
          variants: variants.map(v => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
            sku: v.sku || null,
            price_modifier: v.price_modifier || 0,
          })),
        });
      }

      toast({ title: 'Success', description: `Product ${product ? 'updated' : 'created'} successfully` });
      onClose();
    } catch (error: any) {
      const serverErrors = error.response?.data?.errors;
      const serverMsg = serverErrors
        ? serverErrors.map((e: any) => `${e.field}: ${e.message}`).join('; ')
        : error.response?.data?.message || error.message;
      toast({ title: 'Error', description: serverMsg || `Failed to ${product ? 'update' : 'create'} product`, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select value={formData.subcategory_id} onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })} disabled={!formData.category_id}>
                <SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                <SelectContent>
                  {subcategories?.map((sub) => (
                    <SelectItem key={sub.id} value={String(sub.id)}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" required />
            </div>
            <div>
              <Label htmlFor="originalPrice">Original Price</Label>
              <Input id="originalPrice" type="number" step="0.01" value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <Label htmlFor="discount">Discount %</Label>
              <Input id="discount" type="number" value={formData.discount_percent} onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })} placeholder="0" />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Enter product description" rows={3} />
          </div>

          {/* Sizes */}
          <div>
            <Label>Available Sizes</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {PRESET_SIZES.map(size => (
                <Badge
                  key={size}
                  variant={formData.sizes.includes(size) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input placeholder="Custom size" value={customSize} onChange={(e) => setCustomSize(e.target.value)} className="max-w-32" />
              <Button type="button" variant="outline" size="sm" onClick={addCustomSize}><Plus className="w-4 h-4" /></Button>
            </div>
            {formData.sizes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.sizes.map(size => (
                  <Badge key={size} variant="secondary" className="gap-1">
                    {size}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleSize(size)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Colors */}
          <div>
            <Label>Available Colors</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {PRESET_COLORS.map(color => (
                <Badge
                  key={color}
                  variant={formData.colors.includes(color) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleColor(color)}
                >
                  {color}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input placeholder="Custom color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="max-w-32" />
              <Button type="button" variant="outline" size="sm" onClick={addCustomColor}><Plus className="w-4 h-4" /></Button>
            </div>
            {formData.colors.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.colors.map(color => (
                  <Badge key={color} variant="secondary" className="gap-1">
                    {color}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleColor(color)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Product Variants Management */}
          <div className="border-t pt-4">
            <ProductVariantsManager
              productSizes={formData.sizes}
              productColors={formData.colors}
              variants={variants}
              onVariantsChange={setVariants}
            />
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch id="flash-deal" checked={formData.is_flash_deal} onCheckedChange={(checked) => setFormData({ ...formData, is_flash_deal: checked })} />
              <Label htmlFor="flash-deal">Flash Deal</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="trending" checked={formData.is_trending} onCheckedChange={(checked) => setFormData({ ...formData, is_trending: checked })} />
              <Label htmlFor="trending">Trending</Label>
            </div>
          </div>

          {/* Main Product Image */}
          <div>
            <Label>Main Product Image (JPG, PNG, max 5MB)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
              <input type="file" accept="image/jpeg,image/png" onChange={handleImageChange} className="hidden" id="product-image-upload" />
              <label htmlFor="product-image-upload" className="cursor-pointer">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img src={imagePreview} alt="Product preview" className="w-24 h-24 object-cover rounded-lg mx-auto" />
                    <p className="text-xs text-muted-foreground">Click to change</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">Upload main image</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Additional Images */}
          <div>
            <Label>Additional Images (Gallery)</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {existingImages.map((img) => (
                <div key={img.id} className="relative aspect-square">
                  <img src={img.image_url} alt="Product" className="w-full h-full object-cover rounded-lg" />
                  <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {additionalPreviews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square">
                  <img src={preview} alt="New" className="w-full h-full object-cover rounded-lg" />
                  <button type="button" onClick={() => removeAdditionalImage(idx)} className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <input type="file" accept="image/jpeg,image/png" multiple onChange={handleAdditionalImageChange} className="hidden" />
                <Plus className="w-6 h-6 text-muted-foreground" />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
