'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { aiApi } from '@/lib/api';
import { toast } from 'sonner';

export default function AIInsightsForm({ bonsaiId, onInsightCreated }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions] = useState([
    'How often should I water this bonsai?',
    'What is the best soil mix for this type of bonsai?',
    'When is the best time to prune this bonsai?',
    'How do I protect this bonsai during winter?',
    'What fertilizer should I use for this bonsai?'
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setLoading(true);
      await aiApi.createInsight(bonsaiId, { user_question: question });
      toast.success('AI is analyzing your question');
      setQuestion('');
      
      // Notify parent component to refresh insights
      if (onInsightCreated) {
        onInsightCreated();
      }
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Failed to process your question');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuestion(suggestion);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="question">Ask about your bonsai</Label>
          <Textarea
            id="question"
            placeholder="E.g., How often should I water this type of bonsai?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            className="mt-2"
          />
        </div>
        
        <Button type="submit" disabled={loading || !question.trim()}>
          {loading ? 'Asking...' : 'Ask Question'}
        </Button>
      </form>
      
      <div>
        <Label className="text-sm text-slate-500">Suggested questions:</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
