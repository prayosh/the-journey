import React from 'react';
import { Quote } from '../types.ts';

interface QuoteOfTheDayProps {
    quote: Quote | null;
}

const QuoteOfTheDay: React.FC<QuoteOfTheDayProps> = ({ quote }) => {
    if (!quote) {
        return (
            <div className="max-w-3xl mx-auto mt-12 p-6 border-2 border-dashed rounded-xl app-border transition-colors">
                 <p className="text-center italic text-gray-400">Loading inspiration...</p>
            </div>
        );
    }
    
    return (
        <div className="max-w-3xl mx-auto mt-12 p-6 border-2 border-dashed rounded-xl app-border transition-colors">
            <figure>
                <blockquote className="text-center text-lg italic theme-text">
                    "{quote.quote}"
                </blockquote>
                <figcaption className="text-center text-sm text-gray-400 mt-2">
                    &mdash; {quote.author}
                </figcaption>
            </figure>
        </div>
    );
};

export default QuoteOfTheDay;