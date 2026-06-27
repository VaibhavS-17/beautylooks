'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { blogPosts } from '@/lib/data';

export default function BlogListingPage() {
  return (
    <div className="w-full min-h-screen bg-[#FCFBF9] py-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-[#EFECE6] pb-6 mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold font-display text-gold-gradient">
            Skincare Blog & Guides
          </h1>
          <p className="text-xs text-[#8A8177] mt-2 font-light">
            Discover beauty secrets, facial kit guides, and daily skincare tips from experts.
          </p>
        </div>

        {/* Featured Post (first post) */}
        {blogPosts.length > 0 && (
          <div className="glass-card overflow-hidden border border-[#EFECE6] hover:border-[#C9A94E33] transition-all duration-500 mb-12 group bg-white shadow-sm hover:shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-64 sm:h-80 lg:h-full bg-neutral-900 min-h-[250px]">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#722F37] to-[#C9A94E] opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold font-display text-white/5 select-none uppercase">
                  Featured Guide
                </div>
              </div>
              <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-xs text-[#8A8177]">
                    <span className="font-semibold text-[#9A7B2F] tracking-widest uppercase">Skincare Secrets</span>
                    <span>•</span>
                    <span>{blogPosts[0].publishedAt}</span>
                  </div>
                  <h2 className="font-display font-medium text-2xl sm:text-3xl text-[#1A1A1A] group-hover:text-[#9A7B2F] transition-colors leading-tight">
                    <Link href={`/blog/${blogPosts[0].slug}`}>{blogPosts[0].title}</Link>
                  </h2>
                  <p className="text-sm text-[#5C554D] font-light leading-relaxed">
                    {blogPosts[0].excerpt}
                  </p>
                </div>
                
                <div className="flex items-center justify-between border-t border-[#EFECE6] pt-4">
                  <div className="flex items-center space-x-2 text-xs text-[#8A8177]">
                    <Clock size={12} />
                    <span>{blogPosts[0].readTime} min read</span>
                  </div>
                  <Link
                    href={`/blog/${blogPosts[0].slug}`}
                    className="inline-flex items-center space-x-2 text-sm text-[#9A7B2F] hover:text-[#C9A94E] transition-colors font-semibold"
                  >
                    <span>Read Article</span>
                    <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <div key={post.id} className="glass-card overflow-hidden border border-[#EFECE6] hover:border-[#C9A94E33] group transition-all duration-300 flex flex-col justify-between h-full bg-white shadow-sm hover:shadow-md">
              <div>
                <div className="relative h-48 w-full bg-neutral-900">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#722F37] to-[#C9A94E] opacity-25" />
                  <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold font-display text-white/5 select-none uppercase">
                    Skincare
                  </div>
                  <div className="absolute bottom-4 left-4 inline-block px-2.5 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-medium text-[#C9A94E]">
                    {post.readTime} min read
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <span className="text-[10px] font-semibold text-[#8A8177] tracking-widest uppercase">
                    {post.publishedAt}
                  </span>
                  <h3 className="font-display font-medium text-lg text-[#1A1A1A] group-hover:text-[#9A7B2F] transition-colors line-clamp-1">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-xs text-[#706A60] font-light line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-[#EFECE6] bg-[#FCFBF9] flex justify-end">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-[#9A7B2F] hover:text-[#C9A94E] transition-colors"
                >
                  <span>Read Guide</span>
                  <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
