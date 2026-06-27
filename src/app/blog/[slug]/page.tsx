'use client';

import React, { useMemo, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, User, ChevronRight } from 'lucide-react';
import { blogPosts } from '@/lib/data';

interface BlogPostDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostDetailPage({ params }: BlogPostDetailPageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const post = useMemo(() => blogPosts.find((p) => p.slug === slug), [slug]);

  // Related posts (excluding current post)
  const relatedPosts = useMemo(
    () => blogPosts.filter((p) => p.slug !== slug).slice(0, 2),
    [slug]
  );

  if (!post) {
    return (
      <div className="w-full min-h-screen bg-[#FCFBF9] flex flex-col items-center justify-center text-center px-4 py-20">
        <h2 className="font-display text-2xl text-[#9A7B2F] mb-4">Article Not Found</h2>
        <p className="text-sm text-[#5C554D] max-w-sm mb-6 font-light">
          The blog guide you are looking for does not exist or has been removed from our archives.
        </p>
        <Link href="/blog" className="btn-gold text-xs">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FCFBF9] pt-6 pb-24 text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs text-[#8A8177] mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-[#9A7B2F] transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link href="/blog" className="hover:text-[#9A7B2F] transition-colors">Blog</Link>
          <ChevronRight size={10} />
          <span className="text-[#1A1A1A] font-medium truncate">{post.title}</span>
        </nav>

        {/* Action Bar */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center space-x-2 text-xs text-[#5C554D] hover:text-[#9A7B2F] transition-colors"
          >
            <ArrowLeft size={12} />
            <span>Back to Blog Listing</span>
          </Link>
        </div>

        {/* Article Header */}
        <div className="space-y-4 mb-8">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1A1A1A] leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 items-center text-xs text-[#8A8177] pt-2 border-b border-[#EFECE6] pb-6">
            <div className="flex items-center space-x-1.5">
              <User size={14} className="text-[#9A7B2F]" />
              <span>By {post.authorName}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Calendar size={14} className="text-[#9A7B2F]" />
              <span>{post.publishedAt}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock size={14} className="text-[#9A7B2F]" />
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </div>

        {/* Visual Header / Cover Image Placeholder */}
        <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-neutral-900 border border-[#EFECE6] mb-10 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#722F37] to-[#C9A94E] opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold font-display text-white/5 select-none uppercase tracking-widest">
            skincare
          </div>
        </div>

        {/* Article Content */}
        <article className="text-[#5C554D] text-sm sm:text-base leading-relaxed font-light space-y-6">
          <p className="font-medium text-[#1A1A1A] text-base sm:text-lg italic">
            "{post.excerpt}"
          </p>

          <p>
            Achieving flawless, glowing skin doesn't always require a trip to an expensive spa or salon. With a curated, high-performance skincare routine using authentic products, you can easily replicate professional results at home. Understanding your skin type and using premium products tailored to your needs is the first step toward revealing your natural radiance.
          </p>

          <h3 className="font-display font-medium text-xl text-[#1A1A1A] pt-4">1. Understand Your Skin Needs</h3>
          <p>
            Skincare is not one-size-fits-all. Oily skin benefits from pore-minimizing serums containing ingredients like Niacinamide and salicylic acid, while dry skin needs intense hydration from hyaluronic acid and natural facial oils. For combination skin, balancing oil production on the T-zone while hydrating dry cheeks is key. Sensitive skin requires soothing, botanical formulations that strengthen the skin barrier without causing redness.
          </p>

          <h3 className="font-display font-medium text-xl text-[#1A1A1A] pt-4">2. The Magic of Curated Facial Kits</h3>
          <p>
            Facial kits are excellent because they provide a structured, step-by-step skincare treatment. From deep cleansing to exfoliation, massage, and mask treatments, each step prepares the skin for the next, ensuring maximum absorption of active nutrients. Regular at-home facials (once or twice a month) help remove dead skin cells, stimulate blood circulation, and speed up cellular renewal.
          </p>

          <p>
            For best results, always perform a patch test when trying new formulations, stay consistent with your daily morning and night routines, and never skip SPF protection during the day.
          </p>
        </article>

        {/* Divider */}
        <div className="border-t border-[#EFECE6] my-16" />

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="space-y-6 text-left">
            <h3 className="font-display text-xl font-semibold text-[#1A1A1A]">
              Related Guides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((r) => (
                <Link
                  href={`/blog/${r.slug}`}
                  key={r.id}
                  className="glass-card p-6 border border-[#EFECE6] bg-white hover:border-[#C9A94E25] block group transition-all duration-300 shadow-sm"
                >
                  <span className="text-[10px] text-[#8A8177] uppercase tracking-wider block mb-2">{r.publishedAt}</span>
                  <h4 className="font-display font-medium text-base text-[#1A1A1A] group-hover:text-[#9A7B2F] line-clamp-1 transition-colors">
                    {r.title}
                  </h4>
                  <p className="text-xs text-[#706A60] line-clamp-2 mt-2 font-light leading-relaxed">
                    {r.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
