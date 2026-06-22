interface SkeletonProps {
  type?: 'grid' | 'item' | 'detail' | 'categories';
  count?: number;
}

export default function LoadingSkeleton({ type = 'grid', count = 4 }: SkeletonProps) {
  if (type === 'categories') {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex flex-col items-center rounded-2xl border border-zinc-100 p-6 bg-white dark:bg-zinc-900 dark:border-zinc-800">
            <div className="rounded-full bg-zinc-200 dark:bg-zinc-900 h-12 w-12 mb-3"></div>
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-900 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="animate-pulse grid grid-cols-1 gap-8 md:grid-cols-2 max-w-5xl mx-auto py-8">
        <div className="relative rounded-2xl bg-zinc-200 dark:bg-zinc-900 aspect-[3/4] max-w-md mx-auto w-full"></div>
        <div className="space-y-4">
          <div className="h-8 max-w-[80%] bg-zinc-200 dark:bg-zinc-900 rounded"></div>
          <div className="h-5 max-w-[40%] bg-zinc-200 dark:bg-zinc-900 rounded"></div>
          <div className="h-5 max-w-[25%] bg-zinc-200 dark:bg-zinc-900 rounded"></div>
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-900 rounded"></div>
            <div className="h-4 bg-zinc-200 dark:bg-zinc-900 rounded"></div>
            <div className="h-4 max-w-[90%] bg-zinc-200 dark:bg-zinc-900 rounded"></div>
          </div>
          <div className="flex gap-4 pt-6">
            <div className="h-12 w-32 bg-zinc-200 dark:bg-zinc-900 rounded-xl"></div>
            <div className="h-12 w-32 bg-zinc-200 dark:bg-zinc-900 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" id="loading-skeleton-container">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse space-y-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 p-4 bg-white dark:bg-zinc-900">
          <div className="aspect-[3/4] w-full rounded-xl bg-zinc-300 dark:bg-zinc-800"></div>
          <div className="space-y-2">
            <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-900 rounded"></div>
            <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-900 rounded"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-5 w-1/4 bg-zinc-200 dark:bg-zinc-900 rounded"></div>
              <div className="h-8 w-1/3 bg-zinc-200 dark:bg-zinc-900 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
