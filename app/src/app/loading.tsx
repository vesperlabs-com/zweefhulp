export default function Loading() {
  return (
    <>
      {/* Simple skeleton for home page */}
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="flex-grow flex flex-col items-center justify-center w-full px-4">
          <div className="text-center mb-8 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-4" />
            <div className="w-64 h-12 bg-gray-200 rounded mx-auto mb-4" />
            <div className="w-96 h-4 bg-gray-100 rounded mx-auto" />
          </div>
          <div className="w-full max-w-2xl h-12 bg-gray-100 rounded-full animate-pulse" />
        </div>
      </div>
    </>
  )
}

