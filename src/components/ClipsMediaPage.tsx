import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, Play, Edit, Video, FileCode, Gamepad2, Loader2, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { GameTemplatesService } from '../services/game-templates';
import { useAuth } from '../contexts/AuthContext';
import { BeaconGamesService } from '../services/beacon-games';
import { GameTemplate, BeaconGameWithDetails } from '../types';

// Helper function to determine video source from URL
const getVideoSource = (url: string): string => {
  if (url.includes('vimeo.com')) return 'Vimeo';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  return 'Video';
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to convert video URLs to embeddable format
const getEmbedUrl = (url: string) => {
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
    const videoId = url.includes('youtu.be/') 
      ? url.split('youtu.be/')[1].split('?')[0]
      : url.split('v=')[1].split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  } else if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1].split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
};

export function ClipsMediaPage() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('explainer');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClip, setSelectedClip] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    url: '',
  });
  const [explainerClips, setExplainerClips] = useState<any[]>([]);
  const [matchFootage, setMatchFootage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch game templates with explainer clips
        const gameTemplates = await GameTemplatesService.getAll();
        const explainerClipsData = gameTemplates
          .filter(template => template.explainer_clip) // Only show templates that have explainer clips
          .map(template => ({
            id: template.id,
            title: `${template.name} - Explainer`,
            thumbnail: template.thumbnail || 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400',
            source: getVideoSource(template.explainer_clip!),
            url: template.explainer_clip!,
            relatedEntity: `${template.name} (Game Template)`,
            entityType: 'Game Template',
            duration: 'N/A', // Duration not stored in database
            uploadDate: formatDate(template.created_date),
          }));

        // Fetch beacon games with actual clips
        const beaconGames = await BeaconGamesService.getWithDetails();
        const matchFootageData = beaconGames
          .filter(game => game.actual_clip) // Only show games that have actual clips
          .map(game => ({
            id: game.id,
            title: `${game.game_template_name} at ${game.beacon_name}`,
            thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400', // Default thumbnail
            source: getVideoSource(game.actual_clip!),
            url: game.actual_clip!,
            relatedEntity: `${game.id} Beacon Game`,
            entityType: 'Beacon Game',
            duration: 'N/A', // Duration not stored in database
            uploadDate: formatDate(game.start_time),
            winner: game.outcome?.winners?.[0] || 'N/A', // Get first winner if available
          }));

        setExplainerClips(explainerClipsData);
        setMatchFootage(matchFootageData);
      } catch (err: any) {
        console.error('Error fetching clips data:', err);
        setError(err?.message || 'Failed to load clips data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredExplainerClips = explainerClips.filter((clip) =>
    clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clip.relatedEntity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMatchFootage = matchFootage.filter((clip) =>
    clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clip.relatedEntity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (clip: any) => {
    setSelectedClip(clip);
    setEditForm({
      url: clip.url,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedClip || !editForm.url.trim()) {
      toast.error('Please provide a valid URL');
      return;
    }

    try {
      setSaving(true);

      if (selectedClip.entityType === 'Game Template') {
        // Update game template explainer clip
        await GameTemplatesService.update(selectedClip.id, {
          explainer_clip: editForm.url.trim()
        });

        // Update local state
        setExplainerClips(prev => 
          prev.map(clip => 
            clip.id === selectedClip.id 
              ? { ...clip, url: editForm.url.trim(), source: getVideoSource(editForm.url.trim()) }
              : clip
          )
        );
      } else if (selectedClip.entityType === 'Beacon Game') {
        // Update beacon game actual clip
        await BeaconGamesService.update(selectedClip.id, {
          actual_clip: editForm.url.trim()
        });

        // Update local state
        setMatchFootage(prev => 
          prev.map(clip => 
            clip.id === selectedClip.id 
              ? { ...clip, url: editForm.url.trim(), source: getVideoSource(editForm.url.trim()) }
              : clip
          )
        );
      }

      toast.success('Video URL updated successfully');
      setIsEditDialogOpen(false);
      setSelectedClip(null);
    } catch (err: any) {
      console.error('Error updating clip:', err);
      toast.error(err?.message || 'Failed to update clip. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setSelectedClip(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white mb-2">Clips & Media</h1>
        <p className="text-gray-400">Explainer clips and match footage</p>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-gray-900 border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by clip title or related entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="p-12 bg-gray-900 border-gray-800">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-[#00d9ff]" />
              <span className="text-gray-400">Loading clips data...</span>
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-[#00d9ff] text-black hover:bg-[#00d9ff]/90 px-4 py-2 rounded"
            >
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs for Clip Types */}
      {!loading && !error && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger
            value="explainer"
            className="data-[state=active]:bg-[#00d9ff] data-[state=active]:text-black"
          >
            <FileCode className="h-4 w-4 mr-2" />
            Explainer Clips ({explainerClips.length})
          </TabsTrigger>
          <TabsTrigger
            value="footage"
            className="data-[state=active]:bg-[#ff00ff] data-[state=active]:text-black"
          >
            <Gamepad2 className="h-4 w-4 mr-2" />
            Match Footage ({matchFootage.length})
          </TabsTrigger>
        </TabsList>

        {/* Explainer Clips Gallery */}
        <TabsContent value="explainer" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExplainerClips.map((clip) => (
              <Card
                key={clip.id}
                className="bg-gray-900 border-gray-800 hover:border-[#00d9ff]/50 transition-all group overflow-hidden"
              >
                <div className="relative aspect-video overflow-hidden">
                  <iframe
                    src={getEmbedUrl(clip.url)}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={clip.title}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white mb-2 line-clamp-1">{clip.title}</h3>
                  <div className="flex items-start gap-2 mb-3">
                    <FileCode className="h-4 w-4 text-[#00d9ff] mt-0.5 flex-shrink-0" />
                    <p className="text-gray-400 text-sm">Game Template</p>
                  </div>
                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(clip)}
                      className="w-full border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      <Edit className="h-3 w-3 mr-2" />
                      Edit Video
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Match Footage Gallery */}
        <TabsContent value="footage" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMatchFootage.map((clip) => (
              <Card
                key={clip.id}
                className="bg-gray-900 border-gray-800 hover:border-[#ff00ff]/50 transition-all group overflow-hidden"
              >
                <div className="relative aspect-video overflow-hidden">
                  <iframe
                    src={getEmbedUrl(clip.url)}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={clip.title}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white mb-2 line-clamp-1">{clip.title}</h3>
                  <div className="flex items-start gap-2 mb-2">
                    <Gamepad2 className="h-4 w-4 text-[#ff00ff] mt-0.5 flex-shrink-0" />
                    <p className="text-gray-400 text-sm line-clamp-2">{clip.relatedEntity}</p>
                  </div>
                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(clip)}
                      className="w-full border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      <Edit className="h-3 w-3 mr-2" />
                      Edit Video
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      )}

      {/* Edit Clip Dialog */}
      {isAuthenticated && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Video URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-url" className="text-white">Video URL</Label>
              <Input
                id="edit-url"
                value={editForm.url}
                onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                placeholder="Enter video URL..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={saving}
              className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving || !editForm.url.trim()}
              className="bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      )}
    </div>
  );
}