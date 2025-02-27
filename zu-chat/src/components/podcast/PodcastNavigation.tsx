interface PodcastNavigationProps {
  currentSegment: number;
  totalSegments: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function PodcastNavigation({
  currentSegment,
  totalSegments,
  onPrevious,
  onNext,
}: PodcastNavigationProps) {
  return (
    <div className="flex items-center justify-center w-full gap-4 mb-4">
      <button
        onClick={onPrevious}
        disabled={currentSegment === 0}
        className="p-2 rounded-full bg-blue-500 text-white disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span className="text-sm text-gray-500">
        Segment {currentSegment + 1} of {totalSegments}
      </span>
      <button
        onClick={onNext}
        disabled={currentSegment >= totalSegments - 1}
        className="p-2 rounded-full bg-blue-500 text-white disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
} 