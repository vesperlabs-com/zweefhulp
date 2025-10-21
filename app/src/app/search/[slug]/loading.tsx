export default function Loading() {
  return (
    <>
      {/* Skeleton overlay */}
      <div className="bg-gray-50 min-h-screen">
        {/* Header skeleton */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-6">
              <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="flex-grow h-10 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        </header>

        {/* Main content skeleton */}
        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* Title skeleton */}
          <div className="mb-8">
            <div className="w-32 h-4 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="w-64 h-8 bg-gray-300 rounded animate-pulse" />
          </div>

          {/* Loading spinner */}
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    </>
  )
}

