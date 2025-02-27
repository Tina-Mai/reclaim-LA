import { LANGUAGES, DURATIONS } from "@/lib/constants";

interface PodcastControlsProps {
  language: string;
  duration: string;
  isGenerating: boolean;
  onLanguageChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onGenerate: () => void;
}

export function PodcastControls({
  language,
  duration,
  isGenerating,
  onLanguageChange,
  onDurationChange,
  onGenerate,
}: PodcastControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Language</label>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full p-2 border rounded-md"
            disabled={isGenerating}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
          <select
            value={duration}
            onChange={(e) => onDurationChange(e.target.value)}
            className="w-full p-2 border rounded-md"
            disabled={isGenerating}
          >
            {DURATIONS.map((dur) => (
              <option key={dur.value} value={dur.value}>
                {dur.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:bg-gray-400 font-mono"
      >
        {isGenerating ? "Generating..." : "Generate Podcast"}
      </button>
    </div>
  );
}
