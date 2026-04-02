import React, { useEffect, useState, useRef } from 'react';
import api from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

type Slide = {
  id?: number;
  title?: string;
  subtitle?: string;
  image_url?: string;
  cta_text?: string;
  cta_link?: string;
  slide_order?: number;
  is_active?: boolean;
  animation_type?: string;
  bg_color_start?: string;
  bg_color_end?: string;
  bg_type?: 'solid' | 'gradient' | string;
};

const defaultSlide: Slide = { title: '', subtitle: '', image_url: '', cta_text: '', cta_link: '', slide_order: 0, is_active: true, animation_type: 'fade', bg_color_start: '#ffffff', bg_color_end: '#ffffff', bg_type: 'solid' };

export default function SlidesPage(): JSX.Element {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [saving, setSaving] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await api.get('/slides/all');
      setSlides(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await api.post('/slides/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.data.url;
  };

  const openNew = () => setEditing({ ...defaultSlide, slide_order: (slides.length ? Math.max(...slides.map(s => s.slide_order || 0)) + 1 : 1) });

  const save = async (values: Slide) => {
    setSaving(true);
    try {
      // Basic validation
      if (!values.title || !values.image_url) {
        toast({ title: 'Title and image are required', variant: 'destructive' });
        setSaving(false);
        return;
      }
      if (values.id) {
        await api.put(`/slides/${values.id}`, values);
      } else {
        await api.post('/slides', values);
      }
      await fetchSlides();
      setEditing(null);
      toast({ title: 'Slide saved' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed saving slide', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id?: number) => {
    if (!id) return;
    if (!confirm('Delete this slide?')) return;
    try {
      await api.delete(`/slides/${id}`);
      await fetchSlides();
    } catch (err) {
      console.error(err);
    }
  };

  const uploadAndSetImage = async (file: File) => {
    try {
      const url = await handleUpload(file);
      setEditing((prev) => (prev ? { ...prev, image_url: url } : prev));
      toast({ title: 'Image uploaded' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Image upload failed', variant: 'destructive' });
    }
  };

  const move = async (idx: number, dir: number) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const newSlides = [...slides];
    const a = newSlides[idx];
    const b = newSlides[targetIdx];
    const aOrder = a.slide_order || 0;
    const bOrder = b.slide_order || 0;
    try {
      await api.put(`/slides/${a.id}`, { ...a, slide_order: bOrder });
      await api.put(`/slides/${b.id}`, { ...b, slide_order: aOrder });
      await fetchSlides();
    } catch (err) {
      console.error(err);
    }
  };

  // Drag handlers using HTML5 drag/drop
  const onDragStart = (e: React.DragEvent, idx: number) => {
    dragIndex.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = async (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    const src = dragIndex.current;
    if (src === null || src === undefined) return;
    if (src === targetIdx) return;
    const reordered = [...slides];
    const [moved] = reordered.splice(src, 1);
    reordered.splice(targetIdx, 0, moved);
    // Persist new order
    try {
      for (let i = 0; i < reordered.length; i++) {
        const s = reordered[i];
        const order = i + 1;
        if (s.id && s.slide_order !== order) {
          await api.put(`/slides/${s.id}`, { ...s, slide_order: order });
        }
      }
      await fetchSlides();
      toast({ title: 'Slide order updated' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed updating order', variant: 'destructive' });
    } finally {
      dragIndex.current = null;
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Slides Management</h2>
        <button onClick={openNew} className="px-3 py-1 bg-blue-600 text-white rounded">New Slide</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {slides.length === 0 && <p className="text-gray-500">No slides yet.</p>}
          {slides.sort((a,b)=> (a.slide_order||0)-(b.slide_order||0)).map((s, idx) => (
            <div key={s.id} className="flex items-center gap-4 p-3 border rounded" draggable onDragStart={(e)=>onDragStart(e, idx)} onDragOver={onDragOver} onDrop={(e)=>onDrop(e, idx)}>
              <div className="w-40 h-20 rounded overflow-hidden flex-shrink-0" style={{ background: s.bg_type === 'gradient' && s.bg_color_start && s.bg_color_end ? `linear-gradient(90deg, ${s.bg_color_start}, ${s.bg_color_end})` : (s.bg_color_start || '#fff') }}>
                {s.image_url ? (
                  <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">No image</div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{s.title}</div>
                <div className="text-sm text-gray-600">{s.subtitle}</div>
                <div className="mt-1 text-xs text-muted-foreground">Order: {s.slide_order || '-' } • Animation: {s.animation_type || 'none'}</div>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ background: s.bg_color_start || '#fff', border: '1px solid #ddd' }} />
                    <span className="text-muted-foreground">Start</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ background: s.bg_color_end || '#fff', border: '1px solid #ddd' }} />
                    <span className="text-muted-foreground">End</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(s)} className="px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
                <button onClick={() => move(idx, -1)} className="px-2 py-1 bg-gray-200 rounded">↑</button>
                <button onClick={() => move(idx, 1)} className="px-2 py-1 bg-gray-200 rounded">↓</button>
                <button onClick={() => remove(s.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal (simple inline panel) */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit Slide' : 'New Slide'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-3">
              <input className="border p-2" placeholder="Title" value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <input className="border p-2" placeholder="Subtitle" value={editing.subtitle || ''} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
              <input className="border p-2" placeholder="CTA Text" value={editing.cta_text || ''} onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })} />
              <input className="border p-2" placeholder="CTA Link" value={editing.cta_link || ''} onChange={(e) => setEditing({ ...editing, cta_link: e.target.value })} />
              <select className="border p-2" value={editing.animation_type} onChange={(e) => setEditing({ ...editing, animation_type: e.target.value })}>
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="zoom">Zoom</option>
              </select>
              <div className="flex items-center gap-2">
                <input className="border p-2" type="number" value={editing.slide_order} onChange={(e) => setEditing({ ...editing, slide_order: parseInt(e.target.value || '0', 10) })} />
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAndSetImage(f); }} />
                  {editing.image_url && <img src={editing.image_url} alt="preview" className="w-40 h-20 object-cover rounded" />}
                </div>
              </div>
              <div className="col-span-2 grid grid-cols-3 gap-3 items-center">
                <label className="flex flex-col text-sm">
                  Background Type
                  <select className="border p-2 mt-1" value={editing.bg_type} onChange={(e) => setEditing({ ...editing, bg_type: e.target.value })}>
                    <option value="solid">Solid</option>
                    <option value="gradient">Gradient</option>
                  </select>
                </label>
                <label className="flex flex-col text-sm">
                  Start Color
                  <input type="color" className="w-full h-9 mt-1" value={editing.bg_color_start || '#ffffff'} onChange={(e) => setEditing({ ...editing, bg_color_start: e.target.value })} />
                </label>
                <label className="flex flex-col text-sm">
                  End Color
                  <input type="color" className="w-full h-9 mt-1" value={editing.bg_color_end || '#ffffff'} onChange={(e) => setEditing({ ...editing, bg_color_end: e.target.value })} />
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <div className="flex gap-2">
              <button disabled={saving} onClick={() => editing && save(editing)} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
              <button onClick={() => setEditing(null)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
