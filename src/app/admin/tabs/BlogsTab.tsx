'use client';

import React, { useState } from 'react';
import { Search, Plus, Image as ImageIcon, Edit, Trash2, Loader2, X } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  is_published: boolean;
  published_at: string | null;
}

interface BlogsTabProps {
  blogPosts: BlogItem[];
  deletingBlogId: string | null;
  handleDeleteBlog: (id: string) => Promise<void>;
  handleBlogSubmit: (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => Promise<void>;
  loading: boolean;
}

export default function BlogsTab({
  blogPosts,
  deletingBlogId,
  handleDeleteBlog,
  handleBlogSubmit,
  loading
}: BlogsTabProps) {
  const [blogSearch, setBlogSearch] = useState('');
  const [isAddBlogOpen, setIsAddBlogOpen] = useState(false);
  const [editBlogItem, setEditBlogItem] = useState<BlogItem | null>(null);
  const [uploadedBlogImg, setUploadedBlogImg] = useState('');

  const filteredBlogs = blogPosts.filter(b => 
    b.title.toLowerCase().includes(blogSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display">Journal Blogs</h2>
          <p className="text-sm text-[#8A8177]">Create and edit educational guides and skincare journals.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8177]" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={blogSearch}
              onChange={e => setBlogSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-[#EFECE6] rounded-xl text-xs focus:outline-none focus:border-[#CA8A04] bg-white w-64 shadow-sm"
            />
          </div>
          <button
            onClick={() => {
              setUploadedBlogImg('');
              setIsAddBlogOpen(true);
            }}
            className="px-4 py-2 bg-[#CA8A04] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#1C1917] transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Plus size={14} />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#FBF9F6] border-b border-[#EFECE6] uppercase font-bold text-[#8A8177] tracking-wider">
              <th className="p-4">Title & Info</th>
              <th className="p-4">Excerpt</th>
              <th className="p-4">Publish Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFECE6]">
            {filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#8C8885]">No blog posts found.</td>
              </tr>
            ) : (
              filteredBlogs.map(blog => (
                <tr key={blog.id} className="hover:bg-[#FBF9F6]/50">
                  <td className="p-4 flex items-center space-x-3 max-w-sm">
                    <div className="w-10 h-10 bg-[#FBF9F6] border border-[#EFECE6] rounded-lg overflow-hidden relative shrink-0 flex items-center justify-center">
                      {blog.cover_image ? (
                        <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={16} className="text-[#8C8885]" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold block truncate" title={blog.title}>{blog.title}</span>
                      <span className="text-[10px] text-[#8C8885] block truncate max-w-[150px]">Link: /{blog.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')}</span>
                    </div>
                  </td>
                  <td className="p-4 max-w-xs truncate text-[#8C8885]">{blog.excerpt || 'No description tagline.'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      blog.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {blog.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-[#8C8885]">{blog.published_at ? new Date(blog.published_at).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setUploadedBlogImg(blog.cover_image || '');
                        setEditBlogItem(blog);
                      }}
                      className="p-1.5 border border-[#EFECE6] hover:border-[#CA8A04] hover:text-[#CA8A04] rounded-lg transition-colors inline-block bg-white"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="p-1.5 border border-red-100 hover:border-red-600 hover:text-red-600 text-red-400 rounded-lg transition-colors inline-block bg-white"
                    >
                      {deletingBlogId === blog.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD BLOG MODAL */}
      {isAddBlogOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] animate-fade-in">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <h3 className="font-display font-semibold text-lg text-[#1C1917]">Create Journal Post</h3>
              <button onClick={() => setIsAddBlogOpen(false)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={async (e) => {
              await handleBlogSubmit(e, false);
              setIsAddBlogOpen(false);
            }} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Post Title *</label>
                <input type="text" name="title" required placeholder="e.g. Skin Routine Guide" className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Brief Excerpt / Tagline</label>
                <input type="text" name="excerpt" placeholder="A single sentence summarized layout description..." className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Detailed Content *</label>
                <textarea name="content" required rows={8} placeholder="Write full HTML or Markdown layout body details..." className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
              </div>
              <div>
                <ImageUploader
                  label="Blog Thumbnail / Cover"
                  folder="blogs"
                  currentValue={uploadedBlogImg}
                  onChange={setUploadedBlogImg}
                />
                <input type="hidden" name="coverImage" value={uploadedBlogImg} />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" name="isPublished" value="true" id="isPublishedAdd" className="rounded border-border text-[#CA8A04] focus:ring-[#CA8A04]" />
                <label htmlFor="isPublishedAdd" className="text-xs text-[#5C554D] cursor-pointer select-none">Publish Immediately</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE6] mt-4">
                <button type="button" onClick={() => setIsAddBlogOpen(false)} className="px-4 py-2 border border-[#EFECE6] rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="bg-[#CA8A04] hover:bg-[#1C1917] text-white px-6 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>Save Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editBlogItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] animate-fade-in">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <h3 className="font-display font-semibold text-lg text-[#1C1917]">Edit Journal Post</h3>
              <button onClick={() => setEditBlogItem(null)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={async (e) => {
              await handleBlogSubmit(e, true);
              setEditBlogItem(null);
            }} className="flex-1 overflow-y-auto p-6 space-y-4">
              <input type="hidden" name="id" value={editBlogItem.id} />
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Post Title *</label>
                <input type="text" name="title" defaultValue={editBlogItem.title} required className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Brief Excerpt / Tagline</label>
                <input type="text" name="excerpt" defaultValue={editBlogItem.excerpt || ''} className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Detailed Content *</label>
                <textarea name="content" defaultValue={editBlogItem.content} required rows={8} className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
              </div>
              <div>
                <ImageUploader
                  label="Blog Thumbnail / Cover"
                  folder="blogs"
                  currentValue={uploadedBlogImg}
                  onChange={setUploadedBlogImg}
                />
                <input type="hidden" name="coverImage" value={uploadedBlogImg} />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" name="isPublished" value="true" id="isPublishedEdit" defaultChecked={editBlogItem.is_published} className="rounded border-border text-[#CA8A04] focus:ring-[#CA8A04]" />
                <label htmlFor="isPublishedEdit" className="text-xs text-[#5C554D] cursor-pointer select-none">Published</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE6] mt-4">
                <button type="button" onClick={() => setEditBlogItem(null)} className="px-4 py-2 border border-[#EFECE6] rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="bg-[#CA8A04] hover:bg-[#1C1917] text-white px-6 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
