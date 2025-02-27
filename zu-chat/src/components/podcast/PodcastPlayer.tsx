import { useState, useEffect, useRef } from 'react';
import { EnrichmentPopup } from './EnrichmentPopup';

interface PodcastPlayerProps {
  content: string;
  imageUrl: string | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentSegment: number;
  totalSegments: number;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function PodcastPlayer({
  content,
  imageUrl,
  audioRef,
  currentSegment,
  totalSegments,
  onNext,
  onPrevious,
}: PodcastPlayerProps) {
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [duration, setDuration] = useState("00:00:00");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedText, setSelectedText] = useState('');
  const [showEnrichment, setShowEnrichment] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setIsPlaying(false);
    
    setCurrentTime("00:00:00");
    setProgress(0);
    
    audio.currentTime = 0;
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
    });
  }, [currentSegment, audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const current = formatTime(audio.currentTime);
      const total = formatTime(audio.duration);
      setCurrentTime(current);
      setDuration(total);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateTime);
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('ended', () => {
      if (onNext && currentSegment < totalSegments - 1) {
        onNext();
      }
    });

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateTime);
      audio.removeEventListener('play', () => setIsPlaying(true));
      audio.removeEventListener('pause', () => setIsPlaying(false));
      audio.removeEventListener('ended', () => {
        if (onNext && currentSegment < totalSegments - 1) {
          onNext();
        }
      });
    };
  }, [audioRef, currentSegment, totalSegments, onNext]);

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * audio.duration;
    audio.currentTime = newTime;
  };

  const handlePrevious = () => {
    if (onPrevious && currentSegment > 0) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        setIsPlaying(false);
      }
      onPrevious();
    }
  };

  const handleNext = () => {
    if (onNext && currentSegment < totalSegments - 1) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        setIsPlaying(false);
      }
      onNext();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        if (showEnrichment) {
          setShowEnrichment(false);
          setSelectedText('');
          // Clear text selection
          window.getSelection()?.removeAllRanges();
          // Remove the sidebar class from podcast content
          const mainContent = document.querySelector('.podcast-content');
          if (mainContent) {
            mainContent.classList.remove('with-sidebar');
          }
        } else {
          const selection = window.getSelection();
          if (selection && selection.toString().trim().length > 0) {
            setSelectedText(selection.toString().trim());
            setShowEnrichment(true);
            // Add the sidebar class to podcast content
            const mainContent = document.querySelector('.podcast-content');
            if (mainContent) {
              mainContent.classList.add('with-sidebar');
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showEnrichment]);

  return (
    <div className="w-full bg-zinc-900 rounded-lg overflow-hidden p-6 text-white podcast-content transition-all duration-300 ease-in-out">
      <div className="flex gap-6">
        {/* Left side - Image */}
        <div className="w-64 h-64 flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Podcast cover"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 rounded-lg flex items-center justify-center">
              <div className="text-sm text-zinc-400">No image</div>
            </div>
          )}
        </div>

        {/* Right side - Content */}
        <div className="flex-grow space-y-4">
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm3 7H11V7h2v4h2v2z"/>
              </svg>
              March 10, 2024
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm12 14H9v-2h6v2zm0-4H9v-2h6v2zm0-4H9V9h6v2zm4-5H5V5h14v1z"/>
              </svg>
              Episode {currentSegment + 1}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              {duration}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              5.15 MB
            </span>
          </div>

          <h1 className="text-2xl font-bold">AI Research Discussion</h1>
          
          <div className="relative">
            <p className="text-lg text-zinc-300 select-text">
              {content}
            </p>
            {showEnrichment && selectedText && (
              <EnrichmentPopup
                selectedText={selectedText}
                onClose={() => {
                  setShowEnrichment(false);
                  setSelectedText('');
                }}
              />
            )}
          </div>

          {/* Audio controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentSegment === 0}
                className="p-2 hover:bg-zinc-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 5v14l-11-7z"/>
                </svg>
              </button>
              <button
                onClick={togglePlayPause}
                className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              <button
                onClick={handleNext}
                disabled={currentSegment >= totalSegments - 1}
                className="p-2 hover:bg-zinc-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm min-w-[60px]">{currentTime}</span>
              <div
                className="flex-grow h-2 bg-zinc-700 rounded-full cursor-pointer relative"
                onClick={handleSeek}
              >
                <div
                  className="absolute h-full bg-green-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm min-w-[60px] text-right">{duration}</span>
              <button className="p-2 hover:bg-zinc-800 rounded-full">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .podcast-content {
          position: relative;
          transition: all 0.3s ease-in-out;
          padding-right: 0;
        }
        
        .podcast-content.with-sidebar {
          padding-right: 380px;
        }
      `}</style>
    </div>
  );
} 