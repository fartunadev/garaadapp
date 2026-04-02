import slidesService from '../services/slidesService.js';
import { asyncHandler } from '../utils/helpers.js';

export const getSlides = asyncHandler(async (req, res) => {
  const data = await slidesService.getActiveSlides();
  res.json({ status: 'success', data });
});

// Admin: list all slides
export const getAllSlides = asyncHandler(async (req, res) => {
  const data = await slidesService.getAll();
  res.json({ status: 'success', data });
});

export const createSlide = asyncHandler(async (req, res) => {
  const data = await slidesService.create(req.body);
  res.status(201).json({ status: 'success', data });
});

export const updateSlide = asyncHandler(async (req, res) => {
  const data = await slidesService.update(req.params.id, req.body);
  res.json({ status: 'success', data });
});

export const deleteSlide = asyncHandler(async (req, res) => {
  const data = await slidesService.remove(req.params.id);
  res.json({ status: 'success', data });
});

export const uploadSlideImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }
  const filename = req.file.filename;
  const url = `${req.protocol}://${req.get('host')}/uploads/slides/${filename}`;
  res.status(201).json({ status: 'success', data: { url, filename } });
});

export default { getSlides, getAllSlides, createSlide, updateSlide, deleteSlide, uploadSlideImage };
