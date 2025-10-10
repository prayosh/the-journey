import React from 'react';
import { Quote } from '../types';

interface QuoteOfTheDayProps {
    quote: Quote | null;
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
}

const QuoteOfTheDay: React.FC<QuoteOfTheDayProps> = ({ quote, isLoading, error, onRetry }) => {
    return (
        <div className="max-w-3xl mx-auto mt-12 p-6 border-2 border-dashed rounded-xl app-border transition-colors">
            {isLoading && (
                <p className="text-center italic text-gray-400">Fetching today's inspiration...</p>
            )}
            {error && (
                <div className="text-center text-red-400">
                    <p>{error}</p>
                    <button 
                        onClick={onRetry} 
                        className="mt-2 px-4 py-1 text-sm rounded-md theme-bg text-white hover:opacity-80 transition"
                    >
                        Retry
                    </button>
                </div>
            )}
            {!isLoading && !error && quote && (
                <figure>
                    <blockquote className="text-center text-lg italic theme-text">
                        "{quote.quote}"
                    </blockquote>
                    <figcaption className="text-center text-sm text-gray-400 mt-2">
                        &mdash; {quote.author}
                    </figcaption>
                </figure>
            )}
        </div>
    );
};

export default QuoteOfTheDay;
