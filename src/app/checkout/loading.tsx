export default function CheckoutLoading() {
  return (
    <div className="w-full min-h-screen bg-[#FBF9F6] py-12 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 bg-stone-200 rounded-lg mb-2"></div>
          <div className="h-4 w-64 bg-stone-100 rounded"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Main Form Skeleton */}
          <div className="lg:w-2/3 space-y-8">
            {[1, 2].map((section) => (
              <div key={section} className="bg-white border border-[#EFECE6] p-8 space-y-6">
                <div className="h-6 w-48 bg-stone-200 rounded"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-stone-100 rounded"></div>
                    <div className="h-12 w-full bg-stone-50 rounded-lg border border-[#EFECE6]"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-stone-100 rounded"></div>
                    <div className="h-12 w-full bg-stone-50 rounded-lg border border-[#EFECE6]"></div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="h-4 w-24 bg-stone-100 rounded"></div>
                    <div className="h-12 w-full bg-stone-50 rounded-lg border border-[#EFECE6]"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Skeleton */}
          <div className="lg:w-1/3">
            <div className="bg-white border border-[#EFECE6] p-8 sticky top-24 space-y-6">
              <div className="h-6 w-40 bg-stone-200 rounded"></div>
              
              <div className="space-y-4 pt-4 border-t border-[#EFECE6]">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-16 h-16 bg-stone-100 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full bg-stone-200 rounded"></div>
                      <div className="h-3 w-16 bg-stone-100 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-[#EFECE6]">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-stone-100 rounded"></div>
                  <div className="h-4 w-16 bg-stone-100 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-stone-100 rounded"></div>
                  <div className="h-4 w-16 bg-stone-100 rounded"></div>
                </div>
                <div className="flex justify-between pt-4 border-t border-[#EFECE6]">
                  <div className="h-5 w-24 bg-stone-200 rounded"></div>
                  <div className="h-5 w-20 bg-stone-200 rounded"></div>
                </div>
              </div>

              <div className="h-14 w-full bg-stone-200 rounded-xl mt-6"></div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
