import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface EnrichmentPopupProps {
  selectedText: string;
  onClose: () => void;
}

export function EnrichmentPopup({ selectedText, onClose }: EnrichmentPopupProps) {
  const [enrichedContent, setEnrichedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const enrichText = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: selectedText,
          prompt: "Provide 1-2 key facts about this text. Format as markdown with proper headings (##) and bullet points. Maximum 25 words total. Focus on the most essential historical context or statistics. Be extremely concise and direct."
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enrich text');
      }

      const data = await response.json();
      setEnrichedContent(data.enrichedContent);
      
      // Add transition class to main content
      const mainContent = document.querySelector('.podcast-content');
      if (mainContent) {
        mainContent.classList.add('with-sidebar');
      }
    } catch (error) {
      console.error('Error enriching text:', error);
      setEnrichedContent('Failed to enrich text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    enrichText();
  }, []);

  const handleClose = () => {
    // Remove transition class from main content
    const mainContent = document.querySelector('.podcast-content');
    if (mainContent) {
      mainContent.classList.remove('with-sidebar');
    }
    onClose();
  };

  return (
    <div className="fixed top-0 right-0 h-full w-[380px] bg-zinc-900 text-white shadow-xl flex flex-col border-l border-zinc-700">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-700 bg-zinc-800">
        <h3 className="text-base font-medium">Additional Context</h3>
        <button
          onClick={handleClose}
          className="text-zinc-400 hover:text-white transition-colors p-1.5 hover:bg-zinc-700 rounded-full"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800">
        {/* Selected Text */}
        <div className="bg-zinc-800/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-zinc-400 mb-2">Selected Text</h4>
          <p className="text-base text-zinc-300">{selectedText}</p>
        </div>

        {/* Enriched Content */}
        <div className="bg-zinc-800/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-zinc-400 mb-2">Key Facts</h4>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="text-base text-zinc-300 prose prose-invert max-w-none leading-relaxed prose-headings:mt-0 prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
              <ReactMarkdown>{enrichedContent}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 