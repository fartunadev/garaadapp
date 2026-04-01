import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, Download, FileSpreadsheet, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CategoryFormModal from './CategoryFormModal';
import { useCategories, useSubcategories, useDeleteCategory, useDeleteSubcategory } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

const ITEMS_PER_PAGE = 20;

const CategoriesPage = () => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [subcategorySearch, setSubcategorySearch] = useState('');
  const [categoryPage, setCategoryPage] = useState(1);
  const [subcategoryPage, setSubcategoryPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<'all' | 'monthly' | 'yearly'>('all');
  
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: subcategories, isLoading: loadingSubcategories } = useSubcategories();
  const deleteCategory = useDeleteCategory();
  const deleteSubcategory = useDeleteSubcategory();
  const { toast } = useToast();

  // Filter categories
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    let filtered = categories;

    if (categorySearch) {
      const query = categorySearch.toLowerCase();
      filtered = filtered.filter((cat) =>
        cat.name.toLowerCase().includes(query) || cat.slug.toLowerCase().includes(query)
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      let start: Date, end: Date;
      if (dateFilter === 'monthly') {
        start = startOfMonth(now);
        end = endOfMonth(now);
      } else {
        start = startOfYear(now);
        end = endOfYear(now);
      }
      filtered = filtered.filter((cat) =>
        isWithinInterval(new Date(cat.created_at), { start, end })
      );
    }

    return filtered;
  }, [categories, categorySearch, dateFilter]);

  // Filter subcategories
  const filteredSubcategories = useMemo(() => {
    if (!subcategories) return [];
    let filtered = subcategories;

    if (subcategorySearch) {
      const query = subcategorySearch.toLowerCase();
      filtered = filtered.filter((sub) =>
        sub.name.toLowerCase().includes(query) ||
        sub.slug.toLowerCase().includes(query) ||
        sub.category?.name?.toLowerCase().includes(query)
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      let start: Date, end: Date;
      if (dateFilter === 'monthly') {
        start = startOfMonth(now);
        end = endOfMonth(now);
      } else {
        start = startOfYear(now);
        end = endOfYear(now);
      }
      filtered = filtered.filter((sub) =>
        isWithinInterval(new Date(sub.created_at), { start, end })
      );
    }

    return filtered;
  }, [subcategories, subcategorySearch, dateFilter]);

  // Pagination
  const totalCategoryPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = useMemo(() => {
    const start = (categoryPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCategories, categoryPage]);

  const totalSubcategoryPages = Math.ceil(filteredSubcategories.length / ITEMS_PER_PAGE);
  const paginatedSubcategories = useMemo(() => {
    const start = (subcategoryPage - 1) * ITEMS_PER_PAGE;
    return filteredSubcategories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSubcategories, subcategoryPage]);

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? All subcategories will also be deleted.')) {
      try {
        await deleteCategory.mutateAsync(id);
        toast({
          title: 'Success',
          description: 'Category deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete category',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await deleteSubcategory.mutateAsync(id);
        toast({
          title: 'Success',
          description: 'Subcategory deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete subcategory',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleEditSubcategory = (subcategory: any) => {
    setEditingSubcategory(subcategory);
    setShowSubcategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleCloseSubcategoryModal = () => {
    setShowSubcategoryModal(false);
    setEditingSubcategory(null);
  };

  const exportCategoriesToPDF = () => {
    const doc = new jsPDF();
    doc.text('Categories Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'PPP')}`, 14, 22);
    doc.text(`Total Categories: ${filteredCategories.length}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Name', 'Slug', 'Subcategories', 'Created']],
      body: filteredCategories.map((cat) => [
        cat.name,
        cat.slug,
        subcategories?.filter((s) => s.category_id === cat.id).length || 0,
        format(new Date(cat.created_at), 'PP'),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`categories-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast({ title: 'Categories PDF exported' });
  };

  const exportCategoriesToExcel = () => {
    const data = filteredCategories.map((cat) => ({
      Name: cat.name,
      Slug: cat.slug,
      Subcategories: subcategories?.filter((s) => s.category_id === cat.id).length || 0,
      'Created At': format(new Date(cat.created_at), 'PP'),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Categories');
    XLSX.writeFile(wb, `categories-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: 'Categories Excel exported' });
  };

  const exportSubcategoriesToPDF = () => {
    const doc = new jsPDF();
    doc.text('Subcategories Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'PPP')}`, 14, 22);
    doc.text(`Total Subcategories: ${filteredSubcategories.length}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Name', 'Slug', 'Category', 'Created']],
      body: filteredSubcategories.map((sub) => [
        sub.name,
        sub.slug,
        sub.category?.name || 'N/A',
        format(new Date(sub.created_at), 'PP'),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`subcategories-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast({ title: 'Subcategories PDF exported' });
  };

  const exportSubcategoriesToExcel = () => {
    const data = filteredSubcategories.map((sub) => ({
      Name: sub.name,
      Slug: sub.slug,
      Category: sub.category?.name || 'N/A',
      'Created At': format(new Date(sub.created_at), 'PP'),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subcategories');
    XLSX.writeFile(wb, `subcategories-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: 'Subcategories Excel exported' });
  };

  return (
    <>
      {showCategoryModal && (
        <CategoryFormModal
          type="category"
          onClose={handleCloseCategoryModal}
          editData={editingCategory}
        />
      )}
      {showSubcategoryModal && (
        <CategoryFormModal
          type="subcategory"
          onClose={handleCloseSubcategoryModal}
          categories={categories?.map(c => ({ id: c.id, name: c.name })) || []}
          editData={editingSubcategory}
        />
      )}
      
      <div className="space-y-4 md:space-y-6">
        {/* Global Date Filter */}
        <div className="flex items-center gap-3">
          <Select value={dateFilter} onValueChange={(value: any) => { setDateFilter(value); setCategoryPage(1); setSubcategoryPage(1); }}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="yearly">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categories Section */}
        {/* Categories Section */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 md:p-6">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base md:text-lg font-bold text-foreground">
                Categories Management ({filteredCategories.length})
              </h2>
              <Button
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Category
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => { setCategorySearch(e.target.value); setCategoryPage(1); }}
                  className="pl-9 h-8 text-sm"
                />
              </div>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={exportCategoriesToPDF}>
                  <Download className="h-3.5 w-3.5 mr-1" />PDF
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={exportCategoriesToExcel}>
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />Excel
                </Button>
              </div>
            </div>
          </div>

          {loadingCategories ? (
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
          ) : paginatedCategories && paginatedCategories.length > 0 ? (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {paginatedCategories.map((cat) => {
                  const subcategoryCount = subcategories?.filter(s => s.category_id === cat.id).length || 0;
                  return (
                    <div key={cat.id} className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-all bg-card group">
                      <div className="relative aspect-square bg-muted">
                        <img
                          src={
                            cat.image_url
                              ? (cat.image_url.startsWith('http') || cat.image_url.startsWith('/')
                                  ? cat.image_url
                                  : `/uploads/categories/${cat.image_url}`)
                              : '/placeholder.svg'
                          }
                          alt={cat.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => handleEditCategory(cat)}
                            className="p-1 bg-white rounded-md shadow-sm hover:bg-primary/10"
                          >
                            <Edit className="w-3 h-3 text-primary" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1 bg-white rounded-md shadow-sm hover:bg-destructive/10"
                            disabled={deleteCategory.isPending}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </button>
                        </div>
                      </div>
                      <div className="p-1.5">
                        <h3 className="font-medium text-foreground text-xs truncate">{cat.name}</h3>
                        <p className="text-[10px] text-muted-foreground">{subcategoryCount} subs</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalCategoryPages > 1 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {((categoryPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(categoryPage * ITEMS_PER_PAGE, filteredCategories.length)} of {filteredCategories.length}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setCategoryPage((p) => Math.max(1, p - 1))} disabled={categoryPage === 1}>
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-xs font-medium">{categoryPage}/{totalCategoryPages}</span>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setCategoryPage((p) => Math.min(totalCategoryPages, p + 1))} disabled={categoryPage === totalCategoryPages}>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm mb-3">
                {categorySearch ? 'No categories found.' : 'No categories yet. Add your first!'}
              </p>
              {!categorySearch && (
                <Button size="sm" onClick={() => setShowCategoryModal(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />Add Category
                </Button>
              )}
            </div>
          )}
        </div>
        {/* <div className="bg-card rounded-xl shadow-sm border border-border p-4 md:p-6">
          <div className="flex flex-col gap-4 mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Categories Management ({filteredCategories.length})
              </h2>
              <Button 
                className="flex items-center gap-2"
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => { setCategorySearch(e.target.value); setCategoryPage(1); }}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportCategoriesToPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={exportCategoriesToExcel}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </div>
          
          {loadingCategories ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-border rounded-xl overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedCategories && paginatedCategories.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedCategories.map((cat) => {
                  const subcategoryCount = subcategories?.filter(s => s.category_id === cat.id).length || 0;
                  return (
                    <div key={cat.id} className="border border-border rounded-xl overflow-hidden hover:shadow-md transition-all bg-card">
                      <div className="relative aspect-square bg-muted">
                        <img
                          src={(!cat.image_url || cat.image_url.startsWith('http') || cat.image_url.startsWith('/') ? cat.image_url : `/uploads/categories/${cat.image_url}`) || '/placeholder.svg'}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button 
                            onClick={() => handleEditCategory(cat)}
                            className="p-1.5 bg-card hover:bg-primary/10 rounded-lg transition-colors shadow-sm"
                          >
                            <Edit className="w-4 h-4 text-primary" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 bg-card hover:bg-destructive/10 rounded-lg transition-colors shadow-sm"
                            disabled={deleteCategory.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">{cat.name}</h3>
                        <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
                          <p>{subcategoryCount} Subcategories</p>
                          <p className="text-xs text-muted-foreground">Slug: {cat.slug}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalCategoryPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {((categoryPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(categoryPage * ITEMS_PER_PAGE, filteredCategories.length)} of {filteredCategories.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCategoryPage((p) => Math.max(1, p - 1))} disabled={categoryPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium px-2">Page {categoryPage} of {totalCategoryPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCategoryPage((p) => Math.min(totalCategoryPages, p + 1))} disabled={categoryPage === totalCategoryPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {categorySearch ? 'No categories found matching your search.' : 'No categories found. Add your first category!'}
              </p>
              {!categorySearch && (
                <Button onClick={() => setShowCategoryModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              )}
            </div>
          )}
        </div> */}

        {/* Subcategories Section */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 md:p-6">
          <div className="flex flex-col gap-4 mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Subcategories ({filteredSubcategories.length})
              </h2>
              <Button 
                className="flex items-center gap-2"
                onClick={() => {
                  setEditingSubcategory(null);
                  setShowSubcategoryModal(true);
                }}
                disabled={!categories || categories.length === 0}
              >
                <Plus className="w-4 h-4" />
                Add Subcategory
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subcategories..."
                  value={subcategorySearch}
                  onChange={(e) => { setSubcategorySearch(e.target.value); setSubcategoryPage(1); }}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportSubcategoriesToPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={exportSubcategoriesToExcel}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </div>

          {loadingSubcategories ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : paginatedSubcategories && paginatedSubcategories.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Image</th>
                      <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Name</th>
                      <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Category</th>
                      <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Slug</th>
                      <th className="text-left py-3 px-4 md:px-6 text-xs md:text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedSubcategories.map((sub) => (
                      <tr key={sub.id} className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 md:px-6">
                          <img 
                            src={(!sub.image_url || sub.image_url.startsWith('http') || sub.image_url.startsWith('/') ? sub.image_url : `/uploads/categories/${sub.image_url}`) || '/placeholder.svg'}
                            alt={sub.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        </td>
                        <td className="py-3 px-4 md:px-6 font-medium text-foreground text-sm">{sub.name}</td>
                        <td className="py-3 px-4 md:px-6 text-muted-foreground text-sm">
                          {sub.category?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 md:px-6 text-muted-foreground text-sm">{sub.slug}</td>
                        <td className="py-3 px-4 md:px-6">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditSubcategory(sub)}
                              className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSubcategory(sub.id)}
                              className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                              disabled={deleteSubcategory.isPending}
                            >
                              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalSubcategoryPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {((subcategoryPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(subcategoryPage * ITEMS_PER_PAGE, filteredSubcategories.length)} of {filteredSubcategories.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSubcategoryPage((p) => Math.max(1, p - 1))} disabled={subcategoryPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium px-2">Page {subcategoryPage} of {totalSubcategoryPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setSubcategoryPage((p) => Math.min(totalSubcategoryPages, p + 1))} disabled={subcategoryPage === totalSubcategoryPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {subcategorySearch
                  ? 'No subcategories found matching your search.'
                  : categories && categories.length === 0 
                    ? 'Add a category first before creating subcategories.' 
                    : 'No subcategories found.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoriesPage;
