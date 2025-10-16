import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { pb } from '@/lib/pocketbase';
import { useToast } from '@/hooks/use-toast';

const BACKEND_URL = "https://n8n.levelingupdata.com/webhook/starfish";

interface Message {
  text: string;
  sender: 'user' | 'bot';
  fileUrl?: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastBlobUrlRef = useRef<string | null>(null);
  const { toast } = useToast();

  const isAuthenticated = pb.authStore.isValid && pb.authStore.model;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (lastBlobUrlRef.current) {
        URL.revokeObjectURL(lastBlobUrlRef.current);
        lastBlobUrlRef.current = null;
      }
    };
  }, []);

  const appendMessage = (text: string, sender: 'user' | 'bot', fileUrl?: string) => {
    setMessages(prev => [...prev, { text, sender, fileUrl }]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in or sign up to use the file upload feature.",
        variant: "destructive",
      });
      e.target.value = ''; // Clear the file input
      return;
    }

    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const sendMessage = async () => {
    if (isLoading) return;
    const text = inputText.trim();
    const file = selectedFile;

    if (!text && !file) return;

    // Check if user is trying to send a file without being authenticated
    if (file && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in or sign up to use the file upload feature.",
        variant: "destructive",
      });
      return;
    }

    let userMsg = text || "[file attached]";
    if (file && !text) userMsg = `Sent a file: ${file.name}`;
    if (file && text) userMsg = `${text} (with file: ${file.name})`;

    appendMessage(userMsg, 'user');
    setInputText('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      setIsLoading(true);
      let res;
      if (file) {
        const form = new FormData();
        if (text) form.append('query', text);
        form.append('file', file, file.name);
        form.append('event', text ? 'text_with_file' : 'file');
        form.append('file_name', file.name);
        form.append('file_mime', file.type || 'application/octet-stream');
        form.append('file_size', String(file.size));
        res = await fetch(BACKEND_URL, { method: 'POST', body: form });
      } else {
        const payload = { event: 'text', query: text };
        res = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      let reply = "Sorry, I didn't get that.";
      if (Array.isArray(data) && data.length > 0) {
        reply = data[0].output || JSON.stringify(data[0]);
      } else if (typeof data === 'object') {
        reply = data.output || data.answer || JSON.stringify(data);
      } else {
        reply = data;
      }

      appendMessage(reply, 'bot');

      // File download link if present
      try {
        let fileUrl = null;
        if (data && typeof data === 'object') {
          fileUrl = data.file_url || data.url || data.download_url || null;
        }
        if (!fileUrl && file) {
          fileUrl = URL.createObjectURL(file);
          lastBlobUrlRef.current = fileUrl;
        }
      } catch (e) {
        // Silent fail
      }
    } catch (err) {
      appendMessage('⚠️ Backend error', 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button - Positioned above Sentry feedback */}
      <button
        id="chatbot-button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 hover:scale-110"
        data-testid="button-chatbot-open"
        title="Open chatbot"
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          id="chatbot-window"
          className="fixed bottom-20 right-6 w-96 h-[500px] bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col"
          data-testid="chatbot-window"
        >
          {/* Header */}
          <div
            id="chatbot-header"
            className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-3 rounded-t-lg flex justify-between items-center"
          >
            <span className="font-semibold">Have a question? Ask us!</span>
            <button
              id="chatbot-close"
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded p-1 transition"
              data-testid="button-chatbot-close"
              title="Close chatbot"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div
            id="chatbot-messages"
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-background"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.fileUrl ? (
                  <div className="bg-muted px-4 py-2 rounded-lg max-w-[80%]">
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                      data-testid="link-download-file"
                    >
                      {msg.text}
                    </a>
                  </div>
                ) : (
                  <div
                    className={`px-4 py-2 rounded-lg max-w-[80%] ${msg.sender === 'user'
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : 'bg-muted text-foreground'
                      }`}
                  >
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground px-3 py-2 rounded-lg inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* File Row */}
          <div id="chatbot-file-row" className="px-4 py-2 border-t border-border bg-card">
            <div className="flex flex-col gap-1">
              <input
                type="file"
                id="chatbot-file"
                ref={fileInputRef}
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                disabled={isLoading || !isAuthenticated}
                className={`text-sm text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer ${isLoading || !isAuthenticated ? 'opacity-60 cursor-not-allowed' : ''}`}
                data-testid="input-chatbot-file"
                title="Upload file"
                aria-label="Upload file for chatbot"
              />
              {!isAuthenticated && (
                <div className="text-xs text-muted-foreground">
                  Sign in to upload files
                </div>
              )}
              {selectedFile && (
                <div
                  id="chatbot-filename"
                  className="text-xs text-muted-foreground mt-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]"
                  data-testid="text-filename"
                >
                  {selectedFile.name}
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div id="chatbot-input" className="px-4 py-3 border-t border-border bg-card rounded-b-lg flex gap-2">
            <input
              type="text"
              id="chatbot-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isLoading}
              className={`flex-1 px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              data-testid="input-chatbot-text"
            />
            <button
              id="chatbot-send"
              onClick={sendMessage}
              disabled={isLoading}
              className={`bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg transition ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
              data-testid="button-chatbot-send"
            >
              {isLoading ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
