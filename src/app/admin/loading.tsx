export default function AdminLoading() {
  return (
    <div className="flex h-screen bg-[#FBF9F6] animate-pulse">
      {/* Sidebar Skeleton */}
      <aside className="w-64 bg-white border-r border-[#EFECE6] flex flex-col justify-between hidden md:flex">
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-stone-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-stone-200 rounded"></div>
              <div className="h-2 w-16 bg-stone-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-10 w-full bg-stone-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#EFECE6] flex items-center justify-between px-8">
          <div className="h-6 w-48 bg-stone-100 rounded"></div>
          <div className="flex space-x-4">
            <div className="h-10 w-32 bg-stone-100 rounded-xl"></div>
            <div className="h-10 w-10 bg-stone-100 rounded-full"></div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-white border border-[#EFECE6] rounded-2xl p-6 flex flex-col justify-between">
                <div className="h-10 w-10 rounded-full bg-stone-100"></div>
                <div className="space-y-2 mt-4">
                  <div className="h-4 w-1/2 bg-stone-100 rounded"></div>
                  <div className="h-8 w-1/3 bg-stone-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-96 w-full bg-white border border-[#EFECE6] rounded-2xl"></div>
        </div>
      </main>
    </div>
  );
}
