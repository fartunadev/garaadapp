import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateCategory, useUpdateCategory, useCreateSubcategory, useUpdateSubcategory } from '@/hooks/useCategories';
import { uploadCategoryImage } from '@/hooks/useProducts';

interface CategoryFormModalProps {
  type: 'category' | 'subcategory';
  onClose: () => void;
  categories?: { id: string; name: string }[];
  editData?: any;
}

const CategoryFormModal = ({ type, onClose, categories = [], editData }: CategoryFormModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: '',
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const createSubcategory = useCreateSubcategory();
  const updateSubcategory = useUpdateSubcategory();

  // Load edit data
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        slug: editData.slug || '',
        categoryId: editData.category_id ? String(editData.category_id) : '',
        image: null,
      });
      const normalizeUrl = (url: string) =>
        !url || url.startsWith('http') || url.startsWith('/') ? url : `/uploads/categories/${url}`;
      setImagePreview(normalizeUrl(editData.image_url || ''));
    }
  }, [editData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Image must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }

      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Only JPG and PNG files are allowed',
          variant: 'destructive',
        });
        return;
      }

      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (type === 'subcategory' && !formData.categoryId) {
      toast({
        title: 'Missing category',
        description: 'Please select a parent category',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let image_url = editData?.image_url || undefined;

      // Upload image if new file selected
      if (formData.image) {
        try {
          image_url = await uploadCategoryImage(formData.image);
        } catch {
          toast({
            title: 'Image upload failed',
            description: 'Saving with existing image',
            variant: 'destructive',
          });
        }
      }

      if (type === 'category') {
        if (editData) {
          await updateCategory.mutateAsync({
            id: editData.id,
            name: formData.name,
            slug: formData.slug,
            image_url,
          });
        } else {
          await createCategory.mutateAsync({
            name: formData.name,
            slug: formData.slug,
            image_url,
          });
        }
      } else {
        if (editData) {
          await updateSubcategory.mutateAsync({
            id: editData.id,
            name: formData.name,
            slug: formData.slug,
            image_url,
          });
        } else {
          await createSubcategory.mutateAsync({
            name: formData.name,
            slug: formData.slug,
            category_id: formData.categoryId,
            image_url,
          });
        }
      }

      toast({
        title: 'Success',
        description: `${type === 'category' ? 'Category' : 'Subcategory'} ${editData ? 'updated' : 'created'} successfully`,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${editData ? 'update' : 'create'} ${type}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-lg border border-border w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {editData ? 'Edit' : 'Add'} {type === 'category' ? 'Category' : 'Subcategory'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={`Enter ${type} name`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="auto-generated-slug"
              required
            />
            <p className="text-xs text-muted-foreground">
              URL-friendly version of the name
            </p>
          </div>

          {type === 'subcategory' && (
            <div className="space-y-2">
              <Label htmlFor="category">Parent Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Image (JPG, PNG, max 5MB)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-sm text-muted-foreground">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Click to upload image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editData ? 'Update' : 'Create'} {type === 'category' ? 'Category' : 'Subcategory'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
