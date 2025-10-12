import React from 'react';
import { Card } from './ui/card';
import { MessageCircle } from 'lucide-react';

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
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white">Chat</h2>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Live</span>
                </div>
              </div>
              <p className="text-sm text-gray-400">Join the conversation with fellow players</p>
            </div>
          </div>
          
          {/* Chat Embed */}
          <div className="relative">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <iframe 
                src="https://www3.cbox.ws/box/?boxid=3549617&boxtag=sa3DrW" 
                width="100%" 
                height="450" 
                allowTransparency="yes" 
                allow="autoplay" 
                frameBorder="0" 
                marginHeight="0" 
                marginWidth="0" 
                scrolling="auto"
                className="rounded-lg"
                style={{ minHeight: '450px' }}
                title="The Beacon Chat"
              />
            </div>
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
