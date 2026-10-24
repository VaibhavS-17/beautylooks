export default function BlogLoading() {
  return (
    <div className="w-full min-h-screen bg-primary">
      {/* Header Skeleton */}
      <div className="w-full bg-[#FCFBF9] border-b border-[#EFECE6] py-16">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="h-10 w-64 bg-stone-200 rounded-lg mx-auto animate-pulse"></div>
          <div className="h-4 w-96 bg-stone-100 rounded mx-auto animate-pulse"></div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col bg-white border border-[#EFECE6] overflow-hidden group">
              {/* Image skeleton */}
              <div className="aspect-[16/10] w-full bg-stone-100 animate-pulse"></div>
              
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Date and read time skeleton */}
                  <div className="flex items-center space-x-4">
                    <div className="h-3 w-24 bg-stone-200 rounded animate-pulse"></div>
                    <div className="h-3 w-16 bg-stone-100 rounded animate-pulse"></div>
                  </div>
                  
                  {/* Title skeleton */}
                  <div className="space-y-2">
                    <div className="h-6 w-full bg-stone-200 rounded animate-pulse"></div>
                    <div className="h-6 w-3/4 bg-stone-200 rounded animate-pulse"></div>
                  </div>
                  
                  {/* Excerpt skeleton */}
                  <div className="space-y-2 pt-2">
                    <div className="h-4 w-full bg-stone-100 rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-stone-100 rounded animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-stone-100 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Author skeleton */}
                <div className="flex items-center space-x-3 pt-6 border-t border-[#EFECE6] mt-6">
                  <div className="w-8 h-8 rounded-full bg-stone-200 animate-pulse"></div>
                  <div className="h-4 w-24 bg-stone-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
