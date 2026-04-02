import { executeQuery } from '../config/database.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

class SlidesService {
  async getActiveSlides() {
    const res = await executeQuery(
      'SELECT id, title, subtitle, image_url, cta_text, cta_link, slide_order, animation_type, bg_color_start, bg_color_end, bg_type FROM slides WHERE ISNULL(is_active,1)=1 ORDER BY ISNULL(slide_order, id) ASC',
      {}
    );
    return res.recordset || [];
  }

  async getAll() {
    const res = await executeQuery('SELECT * FROM slides ORDER BY ISNULL(slide_order, id) ASC', {});
    return res.recordset || [];
  }

  async getById(id) {
    const res = await executeQuery('SELECT * FROM slides WHERE id = @id', { id });
    const slide = res.recordset && res.recordset[0];
    if (!slide) throw ApiError.notFound('Slide not found');
    return slide;
  }

  async create(data) {
    const res = await executeQuery(
      `INSERT INTO slides (title, subtitle, image_url, cta_text, cta_link, slide_order, is_active, animation_type, bg_color_start, bg_color_end, bg_type, created_at, updated_at)
       OUTPUT inserted.*
       VALUES (@title, @subtitle, @imageUrl, @ctaText, @ctaLink, @slideOrder, @isActive, @animationType, @bgColorStart, @bgColorEnd, @bgType, GETUTCDATE(), GETUTCDATE())`,
      {
        title: data.title || null,
        subtitle: data.subtitle || null,
        imageUrl: data.image_url || data.imageUrl || null,
        ctaText: data.cta_text || data.ctaText || null,
        ctaLink: data.cta_link || data.ctaLink || null,
        slideOrder: data.slide_order || data.slideOrder || null,
        isActive: data.is_active === undefined ? 1 : (data.is_active ? 1 : 0),
        animationType: data.animation_type || data.animationType || null,
        bgColorStart: data.bg_color_start || data.bgColorStart || null,
        bgColorEnd: data.bg_color_end || data.bgColorEnd || null,
        bgType: data.bg_type || data.bgType || 'solid',
      }
    );
    const slide = res.recordset && res.recordset[0];
    if (!slide) throw ApiError.internal('Failed to create slide');
    logger.info(`Slide created: ${slide.id}`);
    return slide;
  }

  async update(id, data) {
    const setClauses = [];
    const params = { id };
    if (data.title !== undefined) { setClauses.push('title = @title'); params.title = data.title; }
    if (data.subtitle !== undefined) { setClauses.push('subtitle = @subtitle'); params.subtitle = data.subtitle; }
    if (data.image_url !== undefined) { setClauses.push('image_url = @imageUrl'); params.imageUrl = data.image_url; }
    if (data.cta_text !== undefined) { setClauses.push('cta_text = @ctaText'); params.ctaText = data.cta_text; }
    if (data.cta_link !== undefined) { setClauses.push('cta_link = @ctaLink'); params.ctaLink = data.cta_link; }
    if (data.bg_color_start !== undefined) { setClauses.push('bg_color_start = @bgColorStart'); params.bgColorStart = data.bg_color_start; }
    if (data.bg_color_end !== undefined) { setClauses.push('bg_color_end = @bgColorEnd'); params.bgColorEnd = data.bg_color_end; }
    if (data.bg_type !== undefined) { setClauses.push('bg_type = @bgType'); params.bgType = data.bg_type; }
    if (data.slide_order !== undefined) { setClauses.push('slide_order = @slideOrder'); params.slideOrder = data.slide_order; }
    if (data.is_active !== undefined) { setClauses.push('is_active = @isActive'); params.isActive = data.is_active ? 1 : 0; }
    if (data.animation_type !== undefined) { setClauses.push('animation_type = @animationType'); params.animationType = data.animation_type; }

    if (setClauses.length === 0) return this.getById(id);

    setClauses.push('updated_at = GETUTCDATE()');

    const sql = `UPDATE slides SET ${setClauses.join(', ')} OUTPUT inserted.* WHERE id = @id`;
    const res = await executeQuery(sql, params);
    const slide = res.recordset && res.recordset[0];
    if (!slide) throw ApiError.internal('Failed to update slide');
    logger.info(`Slide updated: ${id}`);
    return slide;
  }

  async remove(id) {
    const res = await executeQuery('DELETE FROM slides OUTPUT deleted.* WHERE id = @id', { id });
    const slide = res.recordset && res.recordset[0];
    if (!slide) throw ApiError.notFound('Slide not found');
    logger.info(`Slide deleted: ${id}`);
    return slide;
  }
}

export default new SlidesService();
