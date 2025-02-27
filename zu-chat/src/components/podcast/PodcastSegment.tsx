interface PodcastSegmentProps {
  content: string;
  imageUrl: string | null;
  speaker: string;
  isGeneratingImages: boolean;
}

export function PodcastSegment({
  content,
  imageUrl,
  speaker,
  isGeneratingImages,
}: PodcastSegmentProps) {
  return (
    <div className="flex gap-4 items-start w-full">
      <div className="w-32 flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${speaker} speaking`}
            className="w-full h-32 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            {isGeneratingImages ? (
              <div className="text-sm text-gray-500">Generating...</div>
            ) : (
              <div className="text-sm text-gray-500">No image</div>
            )}
          </div>
        )}
      </div>
      <div className="flex-grow">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-800">{content}</p>
        </div>
      </div>
    </div>
  );
} 