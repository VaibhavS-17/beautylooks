export default function CartLoading() {
  return (
    <div className="w-full min-h-screen bg-[#FBF9F6] py-12 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Skeleton */}
        <div className="mb-8 flex items-center space-x-4">
          <div className="h-8 w-48 bg-stone-200 rounded-lg"></div>
          <div className="h-6 w-24 bg-stone-100 rounded-full"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Main Cart Items Skeleton */}
          <div className="lg:w-2/3 space-y-6">
            <div className="bg-white border border-[#EFECE6] p-6 lg:p-8 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-[#EFECE6] last:border-0 last:pb-0">
                  <div className="w-full sm:w-32 aspect-square bg-stone-100 rounded-lg"></div>
                  <div className="flex-1 space-y-3 py-2">
                    <div className="flex justify-between">
                      <div className="h-5 w-48 bg-stone-200 rounded"></div>
                      <div className="h-5 w-24 bg-stone-200 rounded"></div>
                    </div>
                    <div className="h-4 w-32 bg-stone-100 rounded"></div>
                    
                    <div className="flex justify-between items-end pt-4">
                      <div className="h-10 w-32 bg-stone-100 rounded-lg border border-[#EFECE6]"></div>
                      <div className="h-4 w-16 bg-stone-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary Skeleton */}
          <div className="lg:w-1/3">
            <div className="bg-white border border-[#EFECE6] p-8 sticky top-24 space-y-6">
              <div className="h-6 w-40 bg-stone-200 rounded"></div>
              
              <div className="space-y-4 pt-6 border-t border-[#EFECE6]">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-stone-100 rounded"></div>
                  <div className="h-4 w-20 bg-stone-100 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-stone-100 rounded"></div>
                  <div className="h-4 w-16 bg-stone-100 rounded"></div>
                </div>
                <div className="flex justify-between pt-4 border-t border-[#EFECE6]">
                  <div className="h-6 w-24 bg-stone-200 rounded"></div>
                  <div className="h-6 w-24 bg-stone-200 rounded"></div>
                </div>
              </div>

              <div className="h-14 w-full bg-stone-200 rounded-xl mt-8"></div>
              <div className="flex justify-center items-center space-x-2 pt-2">
                <div className="h-4 w-4 bg-stone-100 rounded"></div>
                <div className="h-3 w-32 bg-stone-100 rounded"></div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
