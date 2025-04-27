'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function InsightCard({ insight, onDelete }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this insight?')) {
      onDelete(insight.id);
    }
  };

  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex justify-between items-start">
          <span className="line-clamp-1">{insight.user_question}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 h-6 px-2"
          >
            Delete
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-slate-600 line-clamp-3">
          {insight.ai_response}
        </p>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center">
        <span className="text-xs text-slate-400">
          {formatDate(insight.created_at)}
        </span>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="link" size="sm" className="text-sm">
              Read More
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg">{insight.user_question}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-slate-600 whitespace-pre-line">
                {insight.ai_response}
              </p>
              <div className="text-xs text-slate-400 mt-4">
                {formatDate(insight.created_at)}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
