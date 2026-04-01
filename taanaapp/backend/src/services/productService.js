import { executeStoredProcedure, executeQuery } from '../config/database.js';
import ApiError from '../utils/ApiError.js';
import { buildPaginationMeta } from '../utils/helpers.js';
import logger from '../utils/logger.js';

function parseColorsOrSizes(val) {
  if (!val) return [];
  if (val.startsWith('[') || val.startsWith('{')) {
    try { return JSON.parse(val); } catch { /* fall through */ }
  }
  return val.split(',').map(s => s.trim()).filter(Boolean);
}

class ProductService {
  /**
   * Get all products with pagination and filters
   */
  async getAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      categoryId,
      subcategoryId,
      sellerId,
      minPrice,
      maxPrice,
      search,
      isFlashDeal,
      isTrending,
      sort = 'created_at',
      order = 'DESC',
    } = options;

    const result = await executeStoredProcedure('sp_GetProducts', {
      Page: page,
      Limit: limit,
      CategoryId: categoryId,
      SubcategoryId: subcategoryId,
      SellerId: sellerId,
      Search: search,
      MinPrice: minPrice,
      MaxPrice: maxPrice,
      IsFlashDeal: isFlashDeal,
      IsTrending: isTrending,
      SortBy: sort,
      SortOrder: order.toUpperCase(),
    });

    const products = result.recordsets[0] || [];
    const meta = result.recordsets[1]?.[0] || { total: 0, page, limit, total_pages: 0 };

    // Attach nested category/subcategory objects (SP only returns flat ids)
    if (products.length > 0) {
      const catIds = [...new Set(products.filter(p => p.category_id && !p.category).map(p => p.category_id))];
      const subIds = [...new Set(products.filter(p => p.subcategory_id && !p.subcategory).map(p => p.subcategory_id))];
      let catMap = {}, subMap = {};
      if (catIds.length > 0) {
        const catRes = await executeQuery(`SELECT id, name, slug FROM categories WHERE id IN (${catIds.join(',')})`);
        catMap = Object.fromEntries((catRes.recordset || []).map(c => [c.id, c]));
      }
      if (subIds.length > 0) {
        const subRes = await executeQuery(`SELECT id, name, slug FROM subcategories WHERE id IN (${subIds.join(',')})`);
        subMap = Object.fromEntries((subRes.recordset || []).map(s => [s.id, s]));
      }
      products.forEach(p => {
        if (p.category_id && !p.category) p.category = catMap[p.category_id] || null;
        if (p.subcategory_id && !p.subcategory) p.subcategory = subMap[p.subcategory_id] || null;
      });
    }

    products.forEach(p => {
      p.colors = parseColorsOrSizes(p.colors);
      p.sizes = parseColorsOrSizes(p.sizes);
    });

    return {
      data: products,
      meta: {
        total: meta.total,
        page: meta.page,
        limit: meta.limit,
        totalPages: meta.total_pages,
        hasNextPage: page < meta.total_pages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get product by ID
   */
  async getById(id) {
    const result = await executeStoredProcedure('sp_GetProductById', {
      ProductId: id,
    });

    if (!result.recordsets[0] || result.recordsets[0].length === 0) {
      throw ApiError.notFound('Product not found');
    }

    const product = result.recordsets[0][0];
    const images = result.recordsets[1] || [];
    const variants = result.recordsets[2] || [];

    return {
      ...product,
      product_images: images,
      variants,
      colors: parseColorsOrSizes(product.colors),
      sizes: parseColorsOrSizes(product.sizes),
    };
  }

  /**
   * Get product by slug
   */
  async getBySlug(slug) {
    const result = await executeStoredProcedure('sp_GetProductBySlug', {
      Slug: slug,
    });

    if (!result.recordsets[0] || result.recordsets[0].length === 0) {
      throw ApiError.notFound('Product not found');
    }

    const product = result.recordsets[0][0];
    const images = result.recordsets[1] || [];
    const variants = result.recordsets[2] || [];

    return {
      ...product,
      product_images: images,
      variants,
      colors: parseColorsOrSizes(product.colors),
      sizes: parseColorsOrSizes(product.sizes),
    };
  }

  /**
   * Create new product
   */
  async create(data, sellerId = null) {
    const result = await executeStoredProcedure('sp_CreateProduct', {
      SellerId: sellerId,
      CategoryId: data.categoryId,
      SubcategoryId: data.subcategoryId,
      Name: data.name,
      Description: data.description,
      Price: data.price,
      OriginalPrice: data.originalPrice,
      DiscountPercent: data.discountPercent || 0,
      Stock: data.stock || 0,
      SKU: data.sku,
      ImageUrl: data.imageUrl,
      Colors: Array.isArray(data.colors) && data.colors.length ? data.colors.join(',') : null,
      Sizes: Array.isArray(data.sizes) && data.sizes.length ? data.sizes.join(',') : null,
      IsFlashDeal: data.isFlashDeal || false,
      IsTrending: data.isTrending || false,
    });

    if (!result.recordsets[0] || result.recordsets[0].length === 0) {
      throw ApiError.internal('Failed to create product');
    }

    const product = result.recordsets[0][0];
    logger.info(`Product created: ${product.id}`);

    return product;
  }

  /**
   * Update product
   */
  async update(id, data) {
    const result = await executeStoredProcedure('sp_UpdateProduct', {
      ProductId: id,
      CategoryId: data.categoryId,
      SubcategoryId: data.subcategoryId,
      Name: data.name,
      Description: data.description,
      Price: data.price,
      OriginalPrice: data.originalPrice,
      DiscountPercent: data.discountPercent,
      Stock: data.stock,
      SKU: data.sku,
      ImageUrl: data.imageUrl,
      Colors: Array.isArray(data.colors) && data.colors.length ? data.colors.join(',') : undefined,
      Sizes: Array.isArray(data.sizes) && data.sizes.length ? data.sizes.join(',') : undefined,
      IsFlashDeal: data.isFlashDeal,
      IsTrending: data.isTrending,
      IsActive: data.isActive,
    });

    if (!result.recordsets[0] || result.recordsets[0].length === 0) {
      throw ApiError.notFound('Product not found');
    }

    const product = result.recordsets[0][0];
    logger.info(`Product updated: ${id}`);

    return product;
  }

  /**
   * Delete product (soft delete)
   */
  async delete(id) {
  try {
    await executeStoredProcedure('sp_DeleteProduct', {
      ProductId: parseInt(id),
    });
    logger.info(`Product deleted: ${id}`);
    return { message: 'Product deleted successfully' };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error('Failed to delete product:', err.message);
    throw ApiError.internal('Failed to delete product');
  }
}
  // async delete(id) {
  //   const result = await executeStoredProcedure('sp_DeleteProduct', {
  //     ProductId: id,
  //   });

  //   if (result.recordset[0]?.affected_rows === 0) {
  //     throw ApiError.notFound('Product not found');
  //   }

  //   logger.info(`Product deleted: ${id}`);
  //   return { message: 'Product deleted successfully' };
  // }

  /**
   * Get flash deals
   */
  async getFlashDeals(limit = 10) {
    const result = await executeStoredProcedure('sp_GetFlashDeals', {
      Limit: limit,
    });

    return result.recordset || [];
  }

  /**
   * Get trending products
   */
  async getTrending(limit = 10) {
    const result = await executeStoredProcedure('sp_GetTrendingProducts', {
      Limit: limit,
    });

    return result.recordset || [];
  }

  /**
   * Update product stock
   */
  async updateStock(id, quantity, operation = 'decrease') {
    const result = await executeStoredProcedure('sp_UpdateProductStock', {
      ProductId: id,
      Quantity: quantity,
      Operation: operation,
    });

    if (!result.recordset || result.recordset.length === 0) {
      throw ApiError.notFound('Product not found');
    }

    return { id, stock: result.recordset[0].stock };
  }

  /**
   * Set product stock to an absolute value (admin)
   */
  async updateStockAbsolute(id, stock) {
    const result = await executeQuery(
      `UPDATE dbo.products SET stock = @Stock, updated_at = GETUTCDATE()
       OUTPUT inserted.id, inserted.stock
       WHERE id = @Id`,
      { Stock: stock, Id: id }
    );
    if (!result.recordset || result.recordset.length === 0) {
      throw ApiError.notFound('Product not found');
    }
    return { id, stock: result.recordset[0].stock };
  }

  /**
   * Search products
   */
  async search(query, options = {}) {
    const { page = 1, limit = 10 } = options;

    const result = await executeStoredProcedure('sp_GetProducts', {
      Page: page,
      Limit: limit,
      Search: query,
      SortBy: 'rating',
      SortOrder: 'DESC',
    });

    const products = result.recordsets[0] || [];
    const meta = result.recordsets[1]?.[0] || { total: 0, page, limit, total_pages: 0 };

    return {
      data: products,
      meta: {
        total: meta.total,
        page: meta.page,
        limit: meta.limit,
        totalPages: meta.total_pages,
        hasNextPage: page < meta.total_pages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Add product image
   */
  async addImage(productId, imageUrl, sortOrder = 0) {
    const result = await executeStoredProcedure('sp_AddProductImage', {
      ProductId: productId,
      ImageUrl: imageUrl,
      SortOrder: sortOrder,
    });

    return result.recordset || [];
  }

  /**
   * Delete product image
   */
  async deleteImage(imageId) {
    const result = await executeStoredProcedure('sp_DeleteProductImage', {
      ImageId: imageId,
    });

    return { success: result.recordset[0]?.affected_rows > 0 };
  }

  /**
   * Create product variant
   */
  async createVariant(productId, data) {
    const result = await executeStoredProcedure('sp_CreateProductVariant', {
      ProductId: productId,
      SKU: data.sku,
      Size: data.size,
      Color: data.color,
      PriceModifier: data.priceModifier || 0,
      Stock: data.stock || 0,
    });

    return result.recordset || [];
  }

  /**
   * Update product variant
   */
  async updateVariant(variantId, data) {
    const result = await executeStoredProcedure('sp_UpdateProductVariant', {
      VariantId: variantId,
      SKU: data.sku,
      Size: data.size,
      Color: data.color,
      PriceModifier: data.priceModifier,
      Stock: data.stock,
    });

    return result.recordset?.[0];
  }

  /**
   * Delete product variant
   */
  async deleteVariant(variantId) {
    const result = await executeStoredProcedure('sp_DeleteProductVariant', {
      VariantId: variantId,
    });

    return { success: result.recordset[0]?.affected_rows > 0 };
  }
}

export default new ProductService();
