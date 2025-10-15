import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, Bug, ThumbsUp, ThumbsDown } from 'lucide-react';
import { captureUserFeedback, addUserActionBreadcrumb } from '@/lib/sentry-utils';

interface SentryFeedbackProps {
  trigger?: React.ReactNode;
  type?: 'bug' | 'feedback' | 'general';
}

export function SentryFeedback({ trigger, type = 'general' }: SentryFeedbackProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    
    try {
      // Add breadcrumb for user action
      addUserActionBreadcrumb(`User submitted ${type} feedback`, 'user-feedback');
      
      // Capture user feedback in Sentry
      captureUserFeedback(message, email, name);
      
      // Reset form
      setMessage('');
      setEmail('');
      setName('');
      setIsOpen(false);
      
      // Show success message (you could add a toast here)
      alert('Thank you for your feedback! We\'ll review it and get back to you if needed.');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'bug':
        return <Bug className="h-4 w-4" />;
      case 'feedback':
        return <ThumbsUp className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'bug':
        return 'Report a Bug';
      case 'feedback':
        return 'Share Feedback';
      default:
        return 'Contact Support';
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'bug':
        return 'Please describe the bug you encountered, including steps to reproduce it...';
      case 'feedback':
        return 'We\'d love to hear your thoughts and suggestions...';
      default:
        return 'How can we help you?';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            {getIcon()}
            {getTitle()}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder={getPlaceholder()}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !message.trim()}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Quick feedback buttons for common actions
export function QuickFeedback() {
  return (
    <div className="flex gap-2">
      <SentryFeedback type="bug" trigger={
        <Button variant="outline" size="sm" className="gap-2">
          <Bug className="h-4 w-4" />
          Report Bug
        </Button>
      } />
      <SentryFeedback type="feedback" trigger={
        <Button variant="outline" size="sm" className="gap-2">
          <ThumbsUp className="h-4 w-4" />
          Share Feedback
        </Button>
      } />
    </div>
  );
}
