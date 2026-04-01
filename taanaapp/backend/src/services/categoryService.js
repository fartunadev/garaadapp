import { executeQuery, executeTransaction } from '../config/database.js';
import ApiError from '../utils/ApiError.js';
import { slugify } from '../utils/helpers.js';
import logger from '../utils/logger.js';

class CategoryService {
  /**
   * Get all categories with subcategories
   */
  async getAll() {
    try {
      const categoriesRes = await executeQuery(
        'SELECT * FROM categories ORDER BY name'
      );
      const categories = categoriesRes.recordset || [];

      // Attach subcategories for each category
      for (const category of categories) {
        const subsRes = await executeQuery(
          'SELECT * FROM subcategories WHERE category_id = @categoryId ORDER BY name',
          { categoryId: category.id }
        );
        category.subcategories = subsRes.recordset || [];
      }

      return categories;
    } catch (err) {
      logger.error('Failed to fetch categories:', err);
      throw ApiError.internal('Failed to fetch categories');
    }
  }

  /**
   * Get category by ID
   */
  async getById(id) {
    try {
      const catRes = await executeQuery('SELECT * FROM categories WHERE id = @id', { id });
      const category = catRes.recordset && catRes.recordset[0];
      if (!category) {
        throw ApiError.notFound('Category not found');
      }

      const subsRes = await executeQuery(
        'SELECT * FROM subcategories WHERE category_id = @categoryId ORDER BY name',
        { categoryId: id }
      );
      category.subcategories = subsRes.recordset || [];

      const productsRes = await executeQuery(
        'SELECT id, name, price, image_url, rating FROM products WHERE category_id = @categoryId',
        { categoryId: id }
      );
      category.products = productsRes.recordset || [];

      return category;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.error('Failed to fetch category by id:', err);
      throw ApiError.internal('Failed to fetch category');
    }
  }

  /**
   * Get category by slug
   */
  async getBySlug(slug) {
    try {
      const catRes = await executeQuery('SELECT * FROM categories WHERE slug = @slug', { slug });
      const category = catRes.recordset && catRes.recordset[0];
      if (!category) {
        throw ApiError.notFound('Category not found');
      }

      const subsRes = await executeQuery(
        'SELECT * FROM subcategories WHERE category_id = @categoryId ORDER BY name',
        { categoryId: category.id }
      );
      category.subcategories = subsRes.recordset || [];

      return category;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.error('Failed to fetch category by slug:', err);
      throw ApiError.internal('Failed to fetch category');
    }
  }

  /**
   * Create category
   */
  async create(data) {
    const slug = data.slug || slugify(data.name);
    try {
      // Check slug
      const existsRes = await executeQuery('SELECT id FROM categories WHERE slug = @slug', { slug });
      if (existsRes.recordset && existsRes.recordset.length > 0) {
        throw ApiError.conflict('Category with this slug already exists');
      }

      const insertRes = await executeQuery(
        `INSERT INTO categories (name, slug, image_url, created_at, updated_at)
         OUTPUT inserted.*
         VALUES (@name, @slug, @image_url, GETUTCDATE(), GETUTCDATE())`,
        { name: data.name, slug, image_url: data.imageUrl }
      );

      const category = insertRes.recordset && insertRes.recordset[0];
      logger.info(`Category created: ${category && category.id}`);
      return category;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.error('Category creation error:', err);
      throw ApiError.internal('Failed to create category');
    }
  }

  /**
   * Update category
   */
  async update(id, data) {
    const updateData = {
      name: data.name,
      slug: data.slug,
      image_url: data.imageUrl,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    try {
      if (data.slug) {
        const existsRes = await executeQuery('SELECT id FROM categories WHERE slug = @slug AND id != @id', {
          slug: data.slug,
          id,
        });
        if (existsRes.recordset && existsRes.recordset.length > 0) {
          throw ApiError.conflict('Category with this slug already exists');
        }
      }

      const setClauses = [];
      const params = { id };
      if (updateData.name !== undefined) {
        setClauses.push('name = @name');
        params.name = updateData.name;
      }
      if (updateData.slug !== undefined) {
        setClauses.push('slug = @slug');
        params.slug = updateData.slug;
      }
      if (updateData.image_url !== undefined) {
        setClauses.push('image_url = @image_url');
        params.image_url = updateData.image_url;
      }
      setClauses.push('updated_at = GETUTCDATE()');

      if (setClauses.length === 0) {
        const catRes = await executeQuery('SELECT * FROM categories WHERE id = @id', { id });
        return catRes.recordset && catRes.recordset[0];
      }

      const query = `UPDATE categories SET ${setClauses.join(', ')} OUTPUT inserted.* WHERE id = @id`;
      const res = await executeQuery(query, params);
      const category = res.recordset && res.recordset[0];
      if (!category) {
        throw ApiError.notFound('Category not found');
      }

      logger.info(`Category updated: ${id}`);
      return category;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.error('Failed to update category:', err);
      throw ApiError.internal('Failed to update category');
    }
  }

  /**
   * Delete category
   */
  async delete(id) {
    try {
      const prodRes = await executeQuery('SELECT TOP 1 id FROM products WHERE category_id = @id', { id });
      if (prodRes.recordset && prodRes.recordset.length > 0) {
        throw ApiError.conflict('Cannot delete category with products');
      }

      await executeQuery('DELETE FROM subcategories WHERE category_id = @id', { id });
      const delRes = await executeQuery('DELETE FROM categories WHERE id = @id', { id });

      logger.info(`Category deleted: ${id}`);
      return { message: 'Category deleted successfully' };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.error('Failed to delete category:', err);
      throw ApiError.internal('Failed to delete category');
    }
  }

  /**
   * Get subcategories by category ID
   */
  async getSubcategories(categoryId) {
    try {
      const res = await executeQuery('SELECT * FROM subcategories WHERE category_id = @categoryId ORDER BY name', {
        categoryId,
      });
      return res.recordset || [];
    } catch (err) {
      logger.error('Failed to fetch subcategories:', err);
      throw ApiError.internal('Failed to fetch subcategories');
    }
  }

  /**
   * Create subcategory
   */
  async createSubcategory(categoryId, data) {
    const slug = data.slug || slugify(data.name);
    try {
      const insertRes = await executeQuery(
        `INSERT INTO subcategories (category_id, name, slug, image_url, created_at, updated_at)
         OUTPUT inserted.*
         VALUES (@categoryId, @name, @slug, @image_url, GETUTCDATE(), GETUTCDATE())`,
        { categoryId, name: data.name, slug, image_url: data.imageUrl }
      );
      const subcategory = insertRes.recordset && insertRes.recordset[0];
      logger.info(`Subcategory created: ${subcategory && subcategory.id}`);
      return subcategory;
    } catch (err) {
      logger.error('Subcategory creation error:', err);
      throw ApiError.internal('Failed to create subcategory');
    }
  }

  /**
   * Update subcategory
   */
  async updateSubcategory(id, data) {
    const updateData = {
      name: data.name,
      slug: data.slug,
      image_url: data.imageUrl,
      updated_at: new Date().toISOString(),
    };
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    try {
      const setClauses = [];
      const params = { id };
      if (updateData.name !== undefined) {
        setClauses.push('name = @name');
        params.name = updateData.name;
      }
      if (updateData.slug !== undefined) {
        setClauses.push('slug = @slug');
        params.slug = updateData.slug;
      }
      if (updateData.image_url !== undefined) {
        setClauses.push('image_url = @image_url');
        params.image_url = updateData.image_url;
      }
      setClauses.push('updated_at = GETUTCDATE()');

      if (setClauses.length === 0) {
        const res = await executeQuery('SELECT * FROM subcategories WHERE id = @id', { id });
        return res.recordset && res.recordset[0];
      }

      const query = `UPDATE subcategories SET ${setClauses.join(', ')} OUTPUT inserted.* WHERE id = @id`;
      const res = await executeQuery(query, params);
      const subcategory = res.recordset && res.recordset[0];
      if (!subcategory) throw ApiError.internal('Failed to update subcategory');
      return subcategory;
    } catch (err) {
      logger.error('Failed to update subcategory:', err);
      throw ApiError.internal('Failed to update subcategory');
    }
  }

  /**
   * Delete subcategory
   */
  async deleteSubcategory(id) {
    try {
      const prodRes = await executeQuery('SELECT TOP 1 id FROM products WHERE subcategory_id = @id', { id });
      if (prodRes.recordset && prodRes.recordset.length > 0) {
        throw ApiError.conflict('Cannot delete subcategory with products');
      }

      await executeQuery('DELETE FROM subcategories WHERE id = @id', { id });
      return { message: 'Subcategory deleted successfully' };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.error('Failed to delete subcategory:', err);
      throw ApiError.internal('Failed to delete subcategory');
    }
  }
}

export default new CategoryService();
