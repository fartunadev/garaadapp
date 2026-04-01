// import { initDatabase } from '../config/database.js';
// import ApiError from '../utils/ApiError.js';
// import { paginate, buildPaginationMeta } from '../utils/helpers.js';
// import logger from '../utils/logger.js';

// class ReviewService {
//   /**
//    * Create a new review
//    */
//     constructor() {
//     // Assuming initDatabase is a function that returns the db client
//     this.db = initDatabase();  // Call it once here; if not a function, remove the () and set this.db = initDatabase;
//   }
//   async create(userId, data) {
//     const { productId, rating, title, comment, orderId } = data;

//     // Verify product exists
//       const { data: product, error: productError } = await this.db
//       .from('products')
//       .select('id')
//       .eq('id', productId)
//       .single();

//     if (productError || !product) {
//       throw ApiError.notFound('Product not found');
//     }

//     // Check if user already reviewed this product
//     const { data: existingReview } = await this.db
//       .from('reviews')
//       .select('id')
//       .eq('product_id', productId)
//       .eq('user_id', userId)
//       .single();

//     if (existingReview) {
//       throw ApiError.conflict('You have already reviewed this product');
//     }

//     // Verify purchase if orderId provided
//     let isVerified = false;
//     if (orderId) {
//       const { data: orderItem } = await this.db 
//         .from('order_items')
//         .select('id, orders!inner(user_id, status)')
//         .eq('product_id', productId)
//         .eq('orders.user_id', userId)
//         .eq('orders.status', 'delivered')
//         .single();

//       isVerified = !!orderItem;
//     }

//     // Create review
//     const { data: review, error } = await this.db
//       .from('reviews')
//       .insert({
//         product_id: productId,
//         user_id: userId,
//         order_id: orderId,
//         rating,
//         title,
//         comment,
//         is_verified: isVerified,
//         is_approved: true, // Auto-approve, or set to false for moderation
//       })
//       .select()
//       .single();

//     if (error) {
//       logger.error('Review creation error:', error);
//       throw ApiError.internal('Failed to create review');
//     }

//     // Update product rating
//     await this.updateProductRating(productId);

//     logger.info(`Review created for product ${productId} by user ${userId}`);
//     return review;
//   }

//   /**
//    * Get reviews for a product
//    */
//   async getByProductId(productId, options = {}) {
//     const { page = 1, limit = 10, sort = 'created_at' } = options;
//     const { offset, limit: pageLimit } = paginate(page, limit);

//   const { data, error, count } = await this.db  // Use this.db instead of initDatabase
//       .from('reviews')
//       .select(
//         `
//         *,
//         profiles!reviews_user_id_fkey(full_name, avatar_url)
//       `,
//         { count: 'exact' }
//       )
//       .eq('product_id', productId)
//       .eq('is_approved', true)
//       .order(sort, { ascending: false })
//       .range(offset, offset + pageLimit - 1);

//     if (error) {
//       throw ApiError.internal('Failed to fetch reviews');
//     }

//     return {
//       data,
//       meta: buildPaginationMeta(count, page, pageLimit),
//     };
//   }

//   /**
//    * Get user's reviews
//    */
//   async getUserReviews(userId, options = {}) {
//     const { page = 1, limit = 10 } = options;
//     const { offset, limit: pageLimit } = paginate(page, limit);

//     const { data, error, count } = await this.db
//       .from('reviews')
//       .select(
//         `
//         *,
//         products(id, name, image_url)
//       `,
//         { count: 'exact' }
//       )
//       .eq('user_id', userId)
//       .order('created_at', { ascending: false })
//       .range(offset, offset + pageLimit - 1);

//     if (error) {
//       throw ApiError.internal('Failed to fetch reviews');
//     }

//     return {
//       data,
//       meta: buildPaginationMeta(count, page, pageLimit),
//     };
//   }

//   /**
//    * Get all reviews (admin)
//    */
//   async getAll(options = {}) {
//     const { page = 1, limit = 10, isApproved, rating } = options;
//     const { offset, limit: pageLimit } = paginate(page, limit);

//     let query = this.db
//       .from('reviews')
//       .select(
//         `
//         *,
//         products(id, name),
//         profiles!reviews_user_id_fkey(full_name, email)
//       `,
//         { count: 'exact' }
//       );

//     if (isApproved !== undefined) {
//       query = query.eq('is_approved', isApproved);
//     }

//     if (rating) {
//       query = query.eq('rating', rating);
//     }

//     query = query
//       .order('created_at', { ascending: false })
//       .range(offset, offset + pageLimit - 1);

//     const { data, error, count } = await query;

//     if (error) {
//       throw ApiError.internal('Failed to fetch reviews');
//     }

//     return {
//       data,
//       meta: buildPaginationMeta(count, page, pageLimit),
//     };
//   }

//   /**
//    * Update review
//    */
//   async update(id, userId, data) {
//     // Verify ownership
//     const { data: review, error: fetchError } = await this.db 
//       .from('reviews')
//       .select('user_id')
//       .eq('id', id)
//       .single();

//     if (fetchError || !review) {
//       throw ApiError.notFound('Review not found');
//     }

//     if (review.user_id !== userId) {
//       throw ApiError.forbidden('Access denied');
//     }

//     const updateData = {
//       rating: data.rating,
//       title: data.title,
//       comment: data.comment,
//       updated_at: new Date().toISOString(),
//     };

//     Object.keys(updateData).forEach(
//       (key) => updateData[key] === undefined && delete updateData[key]
//     );

//     const { data: updatedReview, error } = await this.db 
//       .from('reviews')
//       .update(updateData)
//       .eq('id', id)
//       .select()
//       .single();

//     if (error) {
//       throw ApiError.internal('Failed to update review');
//     }

//     // Update product rating if rating changed
//     if (data.rating) {
//       await this.updateProductRating(updatedReview.product_id);
//     }

//     return updatedReview;
//   }

//   /**
//    * Delete review
//    */
//   async delete(id, userId, isAdmin = false) {
//     const { data: review, error: fetchError } = await this.db
//       .from('reviews')
//       .select('user_id, product_id')
//       .eq('id', id)
//       .single();

//     if (fetchError || !review) {
//       throw ApiError.notFound('Review not found');
//     }

//     if (!isAdmin && review.user_id !== userId) {
//       throw ApiError.forbidden('Access denied');
//     }

//     const { error } = await this.db.from('reviews').delete().eq('id', id);

//     if (error) {
//       throw ApiError.internal('Failed to delete review');
//     }

//     // Update product rating
//     await this.updateProductRating(review.product_id);

//     logger.info(`Review deleted: ${id}`);
//     return { message: 'Review deleted successfully' };
//   }

//   /**
//    * Approve review (admin)
//    */
//   async approve(id) {
//     const { data: review, error } = await this.db
//       .from('reviews')
//       .update({ is_approved: true, updated_at: new Date().toISOString() })
//       .eq('id', id)
//       .select()
//       .single();

//     if (error) {
//       throw ApiError.internal('Failed to approve review');
//     }

//     // Update product rating
//     await this.updateProductRating(review.product_id);

//     return review;
//   }

//   /**
//    * Reject review (admin)
//    */
//   async reject(id) {
//     const { data: review, error } = await this.db
//       .from('reviews')
//       .update({ is_approved: false, updated_at: new Date().toISOString() })
//       .eq('id', id)
//       .select()
//       .single();

//     if (error) {
//       throw ApiError.internal('Failed to reject review');
//     }

//     // Update product rating
//     await this.updateProductRating(review.product_id);

//     return review;
//   }

//   /**
//    * Update product rating based on reviews
//    */
//   async updateProductRating(productId) {
//     const { data: reviews } = await this.db
//       .from('reviews')
//       .select('rating')
//       .eq('product_id', productId)
//       .eq('is_approved', true);

//     if (!reviews || reviews.length === 0) {
//       await this.db 
//         .from('products')
//         .update({ rating: null, reviews_count: 0 })
//         .eq('id', productId);
//       return;
//     }

//     const avgRating =
//       reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

//     await this.db 
//       .from('products')
//       .update({
//         rating: Math.round(avgRating * 10) / 10,
//         reviews_count: reviews.length,
//         updated_at: new Date().toISOString(),
//       })
//       .eq('id', productId);
//   }

//   /**
//    * Get review statistics for a product
//    */
//   async getProductStats(productId) {
//     const { data: reviews } = await this.db
//       .from('reviews')
//       .select('rating')
//       .eq('product_id', productId)
//       .eq('is_approved', true);

//     if (!reviews || reviews.length === 0) {
//       return {
//         average: 0,
//         total: 0,
//         distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
//       };
//     }

//     const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
//     reviews.forEach((r) => distribution[r.rating]++);

//     return {
//       average: Math.round(
//         (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
//       ) / 10,
//       total: reviews.length,
//       distribution,
//     };
//   }
// }

// export default new ReviewService();
import { executeQuery } from '../config/database.js';
import ApiError from '../utils/ApiError.js';
import { paginate, buildPaginationMeta } from '../utils/helpers.js';
import logger from '../utils/logger.js';

class ReviewService {
  async create(userId, data) {
    const { productId, rating, title, comment, orderId } = data;

    // verify product
    const prodRes = await executeQuery(
      'SELECT id FROM products WHERE id = @productId',
      { productId }
    );
    if (!prodRes.recordset[0]) throw ApiError.notFound('Product not found');

    // check existing review
    const existRes = await executeQuery(
      'SELECT id FROM reviews WHERE product_id=@productId AND user_id=@userId',
      { productId, userId }
    );
    if (existRes.recordset[0]) throw ApiError.conflict('You have already reviewed this product');

    // verify purchase if orderId provided
    let isVerified = false;
    if (orderId) {
      const orderRes = await executeQuery(
        `SELECT oi.id
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE oi.product_id=@productId AND o.user_id=@userId AND o.status='delivered'`,
        { productId, userId }
      );
      isVerified = !!orderRes.recordset[0];
    }

    // insert review (return inserted row)
    const insertRes = await executeQuery(
      `INSERT INTO reviews (product_id, user_id, order_id, rating, title, comment, is_verified, is_approved, created_at, updated_at)
       OUTPUT INSERTED.*
       VALUES (@productId,@userId,@orderId,@rating,@title,@comment,@isVerified,1,GETUTCDATE(),GETUTCDATE())`,
      { productId, userId, orderId: orderId || null, rating, title: title || null, comment: comment || null, isVerified }
    );

    const review = insertRes.recordset[0];
    if (!review) {
      logger.error('Review creation failed', insertRes);
      throw ApiError.internal('Failed to create review');
    }

    await this.updateProductRating(productId);
    logger.info(`Review created for product ${productId} by user ${userId}`);
    return review;
  }

  async getByProductId(productId, options = {}) {
    const { page = 1, limit = 10, sort = 'created_at' } = options;
    const { offset, limit: pageLimit } = paginate(page, limit);
    const allowedSort = ['created_at', 'rating'];
    const orderBy = allowedSort.includes(sort) ? sort : 'created_at';

    const countRes = await executeQuery(
      'SELECT COUNT(*) AS total FROM reviews WHERE product_id=@productId AND is_approved=1',
      { productId }
    );
    const total = countRes.recordset[0]?.total || 0;

    const rowsRes = await executeQuery(
      `SELECT r.*, pr.id AS product_id, pr.name AS product_name, p.full_name AS user_full_name
       FROM reviews r
       LEFT JOIN products pr ON r.product_id = pr.id
       LEFT JOIN profiles p ON r.user_id = p.id
       WHERE ${where}
       ORDER BY r.created_at DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      { ...params, offset, limit: pageLimit }
    );

    return {
      data: rowsRes.recordset,
      meta: buildPaginationMeta(total, page, pageLimit),
    };
  }

  async getUserReviews(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const { offset, limit: pageLimit } = paginate(page, limit);

    const countRes = await executeQuery(
      'SELECT COUNT(*) AS total FROM reviews WHERE user_id=@userId',
      { userId }
    );
    const total = countRes.recordset[0]?.total || 0;

    const rowsRes = await executeQuery(
      `SELECT r.*, pr.id AS product_id, pr.name AS product_name, pr.image_url AS product_image
       FROM reviews r
       LEFT JOIN products pr ON r.product_id = pr.id
       WHERE r.user_id=@userId
       ORDER BY r.created_at DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      { userId, offset, limit: pageLimit }
    );

    return {
      data: rowsRes.recordset,
      meta: buildPaginationMeta(total, page, pageLimit),
    };
  }

  async getAll(options = {}) {
    const { page = 1, limit = 10, isApproved, rating } = options;
    const { offset, limit: pageLimit } = paginate(page, limit);

    const whereClauses = ['1=1'];
    const params = {};
    if (isApproved !== undefined) {
      whereClauses.push('r.is_approved = @isApproved');
      params.isApproved = isApproved ? 1 : 0;
    }
    if (rating) {
      whereClauses.push('r.rating = @rating');
      params.rating = rating;
    }
    const where = whereClauses.join(' AND ');

    const countRes = await executeQuery(
      `SELECT COUNT(*) AS total FROM reviews r WHERE ${where}`,
      params
    );
    const total = countRes.recordset[0]?.total || 0;

    const rowsRes = await executeQuery(
      `SELECT r.*, pr.id AS product_id, pr.name AS product_name, p.full_name AS user_full_name, p.email AS user_email
       FROM reviews r
       LEFT JOIN products pr ON r.product_id = pr.id
       LEFT JOIN profiles p ON r.user_id = p.id
       WHERE ${where}
       ORDER BY r.created_at DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      { ...params, offset, limit: pageLimit }
    );

    return {
      data: rowsRes.recordset,
      meta: buildPaginationMeta(total, page, pageLimit),
    };
  }

  async update(id, userId, data) {
    // verify ownership
    const fetchRes = await executeQuery('SELECT user_id, product_id FROM reviews WHERE id=@id', { id });
    const review = fetchRes.recordset[0];
    if (!review) throw ApiError.notFound('Review not found');
    if (review.user_id !== userId) throw ApiError.forbidden('Access denied');

    const updateFields = [];
    const params = { id };
    if (data.rating !== undefined) { updateFields.push('rating=@rating'); params.rating = data.rating; }
    if (data.title !== undefined) { updateFields.push('title=@title'); params.title = data.title; }
    if (data.comment !== undefined) { updateFields.push('comment=@comment'); params.comment = data.comment; }
    updateFields.push('updated_at=GETUTCDATE()');

    if (updateFields.length === 0) return review;

    const updateRes = await executeQuery(
      `UPDATE reviews SET ${updateFields.join(', ')} OUTPUT INSERTED.* WHERE id=@id`,
      params
    );
    const updated = updateRes.recordset[0];
    if (!updated) throw ApiError.internal('Failed to update review');

    if (data.rating !== undefined) await this.updateProductRating(updated.product_id);
    return updated;
  }

  async delete(id, userId, isAdmin = false) {
    const fetchRes = await executeQuery('SELECT user_id, product_id FROM reviews WHERE id=@id', { id });
    const review = fetchRes.recordset[0];
    if (!review) throw ApiError.notFound('Review not found');
    if (!isAdmin && review.user_id !== userId) throw ApiError.forbidden('Access denied');

    await executeQuery('DELETE FROM reviews WHERE id=@id', { id });
    await this.updateProductRating(review.product_id);
    logger.info(`Review deleted: ${id}`);
    return { message: 'Review deleted successfully' };
  }

  async approve(id) {
    const res = await executeQuery(
      `UPDATE reviews SET is_approved=1, updated_at=GETUTCDATE() OUTPUT INSERTED.* WHERE id=@id`,
      { id }
    );
    const review = res.recordset[0];
    if (!review) throw ApiError.internal('Failed to approve review');
    await this.updateProductRating(review.product_id);
    return review;
  }

  async reject(id) {
    const res = await executeQuery(
      `UPDATE reviews SET is_approved=0, updated_at=GETUTCDATE() OUTPUT INSERTED.* WHERE id=@id`,
      { id }
    );
    const review = res.recordset[0];
    if (!review) throw ApiError.internal('Failed to reject review');
    await this.updateProductRating(review.product_id);
    return review;
  }

  async updateProductRating(productId) {
    const statsRes = await executeQuery(
      `SELECT AVG(CAST(rating AS FLOAT)) AS avgRating, COUNT(*) AS cnt
       FROM reviews WHERE product_id=@productId AND is_approved=1`,
      { productId }
    );
    const { avgRating, cnt } = statsRes.recordset[0] || { avgRating: null, cnt: 0 };
    if (!cnt) {
      await executeQuery('UPDATE products SET rating=NULL, reviews_count=0, updated_at=GETUTCDATE() WHERE id=@productId', { productId });
      return;
    }
    const rounded = Math.round((avgRating || 0) * 10) / 10;
    await executeQuery(
      `UPDATE products SET rating=@rating, reviews_count=@count, updated_at=GETUTCDATE() WHERE id=@productId`,
      { productId, rating: rounded, count: cnt }
    );
  }

  async getProductStats(productId) {
    const res = await executeQuery(
      `SELECT rating, COUNT(*) AS cnt FROM reviews WHERE product_id=@productId AND is_approved=1 GROUP BY rating`,
      { productId }
    );
    const rows = res.recordset || [];
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let sum = 0;
    rows.forEach(r => {
      distribution[r.rating] = r.cnt;
      total += r.cnt;
      sum += r.rating * r.cnt;
    });
    const average = total ? Math.round((sum / total) * 10) / 10 : 0;
    return { average, total, distribution };
  }
}

export default new ReviewService();