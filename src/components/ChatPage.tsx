import React from 'react';
import { Card } from './ui/card';
import { MessageCircle, ExternalLink } from 'lucide-react';

export function ChatPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#e63946]/10 flex items-center justify-center">
          <MessageCircle className="h-5 w-5 text-[#e63946]" style={{ filter: 'drop-shadow(0 0 6px rgba(230, 57, 70, 0.6))' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Community Chat</h1>
          <p className="text-gray-400">Connect with other players in real-time</p>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="bg-[#0f0f0f] border-gray-800 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">The Beacon Chat</h2>
              <p className="text-sm text-gray-400">Join the conversation with fellow players</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Live</span>
            </div>
          </div>
          
          {/* Chat Embed */}
          <div className="relative">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <iframe 
                src="https://xat.com/embed/chat.php#id=220533585&gn=thebeacon" 
                width="100%" 
                height="486" 
                frameBorder="0" 
                scrolling="no"
                className="rounded-lg"
                style={{ minHeight: '486px' }}
                title="The Beacon Chat"
              />
            </div>
          </div>

          {/* Links */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <a 
              target="_blank" 
              rel="noopener noreferrer"
              href="https://xat.com/web_gear/chat/embed.php?id=220533585&GroupName=thebeacon"
              className="flex items-center gap-2 text-[#e63946] hover:text-[#e63946]/80 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Get thebeacon chat group
            </a>
            <a 
              target="_blank" 
              rel="noopener noreferrer"
              href="https://xat.com/thebeacon"
              className="flex items-center gap-2 text-[#e63946] hover:text-[#e63946]/80 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Go to thebeacon website
            </a>
          </div>
        </div>
      </Card>

      {/* Additional Info */}
      <Card className="bg-[#0f0f0f] border-gray-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Chat Guidelines</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Be respectful to all players and maintain a positive atmosphere</p>
            <p>• Keep conversations relevant to the game and community</p>
            <p>• No spam, harassment, or inappropriate content</p>
            <p>• Use the chat to coordinate strategies and share experiences</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
