export default function AccountLoading() {
  return (
    <div className="w-full min-h-screen bg-[#FBF9F6] py-12 animate-pulse">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 bg-stone-200 rounded-lg mb-2"></div>
          <div className="h-4 w-64 bg-stone-100 rounded"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Skeleton */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white border border-[#EFECE6] rounded-xl p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-full bg-stone-100 rounded-lg"></div>
              ))}
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1 space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-[#EFECE6] rounded-xl p-6 h-32 flex flex-col justify-center space-y-3">
                  <div className="h-10 w-10 bg-stone-100 rounded-full"></div>
                  <div className="h-6 w-24 bg-stone-200 rounded"></div>
                </div>
              ))}
            </div>

            {/* Main Card */}
            <div className="bg-white border border-[#EFECE6] rounded-xl overflow-hidden min-h-[400px]">
              <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center">
                <div className="h-6 w-40 bg-stone-200 rounded"></div>
                <div className="h-8 w-24 bg-stone-100 rounded-md"></div>
              </div>
              <div className="p-6 space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex space-x-4 border-b border-[#EFECE6] pb-6 last:border-0 last:pb-0">
                    <div className="w-16 h-16 bg-stone-100 rounded-lg"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-5 w-48 bg-stone-200 rounded"></div>
                      <div className="h-4 w-32 bg-stone-100 rounded"></div>
                    </div>
                    <div className="h-6 w-24 bg-stone-100 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
