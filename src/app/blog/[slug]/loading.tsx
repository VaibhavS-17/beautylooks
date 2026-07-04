export default function BlogPostLoading() {
  return (
    <div className="w-full min-h-screen bg-[#FBF9F6] py-12 lg:py-20 animate-pulse">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Skeleton */}
        <div className="text-center space-y-6">
          <div className="h-4 w-32 bg-stone-200 rounded mx-auto"></div>
          <div className="h-12 w-full bg-stone-200 rounded-lg mx-auto"></div>
          <div className="h-12 w-3/4 bg-stone-200 rounded-lg mx-auto"></div>
          <div className="flex justify-center items-center space-x-6 pt-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-stone-200"></div>
              <div className="h-4 w-32 bg-stone-100 rounded"></div>
            </div>
            <div className="h-4 w-4 bg-stone-200 rounded-full"></div>
            <div className="h-4 w-24 bg-stone-100 rounded"></div>
          </div>
        </div>

        {/* Featured Image Skeleton */}
        <div className="w-full aspect-[21/9] bg-stone-100 rounded-2xl my-12"></div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          <div className="h-4 w-full bg-stone-100 rounded"></div>
          <div className="h-4 w-full bg-stone-100 rounded"></div>
          <div className="h-4 w-11/12 bg-stone-100 rounded"></div>
          <div className="h-4 w-full bg-stone-100 rounded"></div>
          
          <div className="h-8 w-1/2 bg-stone-200 rounded pt-8 mt-12 mb-6"></div>
          
          <div className="h-4 w-full bg-stone-100 rounded"></div>
          <div className="h-4 w-10/12 bg-stone-100 rounded"></div>
          <div className="h-4 w-full bg-stone-100 rounded"></div>
        </div>
      </div>
    </div>
  );
}
