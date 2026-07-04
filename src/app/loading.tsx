export default function HomeLoading() {
  return (
    <div className="w-full min-h-screen bg-[#FBF9F6] animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="w-full h-[70vh] bg-stone-100 relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 px-4">
          <div className="h-4 w-32 bg-stone-200/50 rounded mx-auto"></div>
          <div className="h-16 w-3/4 max-w-2xl bg-stone-200/50 rounded-lg mx-auto"></div>
          <div className="h-6 w-2/3 max-w-lg bg-stone-200/50 rounded mx-auto"></div>
          <div className="h-12 w-48 bg-stone-200/50 rounded-full mx-auto mt-8"></div>
        </div>
      </div>

      {/* Featured Categories Skeleton */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="h-8 w-64 bg-stone-200 rounded mx-auto"></div>
          <div className="h-4 w-48 bg-stone-100 rounded mx-auto mt-4"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-4">
              <div className="w-full aspect-square bg-stone-100 rounded-full"></div>
              <div className="h-5 w-24 bg-stone-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products Skeleton */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white">
        <div className="text-center mb-12">
          <div className="h-8 w-64 bg-stone-200 rounded mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col space-y-4">
              <div className="w-full aspect-[4/5] bg-stone-100 rounded-2xl"></div>
              <div className="h-5 w-3/4 bg-stone-200 rounded mx-auto"></div>
              <div className="h-4 w-1/2 bg-stone-100 rounded mx-auto"></div>
              <div className="h-6 w-1/4 bg-stone-200 rounded mx-auto pt-2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
