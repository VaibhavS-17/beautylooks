'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock } from 'lucide-react';

interface BlogClientProps {
  blogPosts: any[];
}

export default function BlogClient({ blogPosts }: BlogClientProps) {
  return (
    <div className="w-full min-h-screen bg-primary py-12 text-left">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-border/50 pb-6 mb-10">
          <h1 className="text-3xl sm:text-3xl md:text-4xl font-semibold font-display text-text-main">
            Skincare Blog & Guides
          </h1>
          <p className="text-xs text-text-muted mt-2 font-light">
            Discover beauty secrets, facial kit guides, and daily skincare tips from experts.
          </p>
        </div>

        {/* Featured Post (first post) */}
        {blogPosts.length > 0 && (
          <div className="glass-card overflow-hidden border border-border/50 hover:border-accent/30 transition-all duration-500 mb-12 group bg-white shadow-sm hover:shadow-md rounded-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-64 sm:h-80 lg:h-full bg-brand-dark min-h-[250px]">
                <div className="absolute inset-0 bg-primary/20 opacity-30 z-10" />
                {blogPosts[0].coverImage ? (
                  <Image
                    src={blogPosts[0].coverImage}
                    alt={blogPosts[0].title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-3xl md:text-3xl md:text-5xl font-bold font-display text-white/5 select-none uppercase z-0">
                    Featured Guide
                  </div>
                )}
              </div>
              <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-xs text-text-muted">
                    <span className="font-semibold text-accent tracking-widest uppercase">Skincare Secrets</span>
                    <span>•</span>
                    <span>{blogPosts[0].publishedAt}</span>
                  </div>
                  <h2 className="font-display font-medium text-2xl sm:text-3xl text-text-main group-hover:text-accent transition-colors leading-tight">
                    <Link href={`/blog/${blogPosts[0].slug}`}>{blogPosts[0].title}</Link>
                  </h2>
                  <p className="text-sm text-text-muted font-light leading-relaxed">
                    {blogPosts[0].excerpt}
                  </p>
                </div>
                
                <div className="flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="flex items-center space-x-2 text-xs text-text-muted">
                    <Clock size={12} />
                    <span>{blogPosts[0].readTime} min read</span>
                  </div>
                  <Link
                    href={`/blog/${blogPosts[0].slug}`}
                    className="inline-flex items-center space-x-2 text-sm text-accent hover:text-accent-light transition-colors font-semibold"
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
            <div key={post.id} className="glass-card overflow-hidden border border-border/50 hover:border-accent/30 group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col justify-between h-full bg-white shadow-sm rounded-2xl">
              <div>
                <div className="relative h-48 w-full bg-brand-dark">
                  <div className="absolute inset-0 bg-primary/20 opacity-25 z-10" />
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold font-display text-white/5 select-none uppercase z-0">
                      Skincare
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 inline-block px-2.5 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-medium text-accent z-20">
                    {post.readTime} min read
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <span className="text-[10px] font-semibold text-text-muted tracking-widest uppercase">
                    {post.publishedAt}
                  </span>
                  <h3 className="font-display font-medium text-lg text-text-main group-hover:text-accent transition-colors line-clamp-1">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-xs text-text-muted font-light line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-border/50 bg-secondary flex justify-end">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-accent hover:text-accent-light transition-colors"
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
