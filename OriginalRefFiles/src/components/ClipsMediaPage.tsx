import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, Play, Edit, Video, FileCode, Gamepad2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';

const explainerClips = [
  {
    id: 1,
    title: 'Urban Assault - Explainer',
    thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400',
    source: 'Vimeo',
    url: 'https://vimeo.com/123456789',
    relatedEntity: 'Urban Assault (Game Template)',
    entityType: 'Game Template',
    duration: '2:34',
    uploadDate: '2024-01-10',
  },
  {
    id: 2,
    title: 'Shadow Protocol - Explainer',
    thumbnail: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=400',
    source: 'YouTube',
    url: 'https://youtube.com/watch?v=abc123',
    relatedEntity: 'Shadow Protocol (Game Template)',
    entityType: 'Game Template',
    duration: '3:12',
    uploadDate: '2024-01-15',
  },
  {
    id: 3,
    title: 'Territory Control - Explainer',
    thumbnail: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400',
    source: 'Vimeo',
    url: 'https://vimeo.com/789012345',
    relatedEntity: 'Territory Control (Game Template)',
    entityType: 'Game Template',
    duration: '2:56',
    uploadDate: '2024-01-18',
  },
  {
    id: 4,
    title: 'Night Raid - Explainer',
    thumbnail: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=400',
    source: 'YouTube',
    url: 'https://youtube.com/watch?v=xyz789',
    relatedEntity: 'Night Raid (Game Template)',
    entityType: 'Game Template',
    duration: '3:45',
    uploadDate: '2024-01-22',
  },
  {
    id: 5,
    title: 'Extraction - Explainer',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    source: 'Vimeo',
    url: 'https://vimeo.com/456789012',
    relatedEntity: 'Extraction (Game Template)',
    entityType: 'Game Template',
    duration: '2:18',
    uploadDate: '2024-02-01',
  },
  {
    id: 6,
    title: 'King of the Hill - Explainer',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400',
    source: 'YouTube',
    url: 'https://youtube.com/watch?v=def456',
    relatedEntity: 'King of the Hill (Game Template)',
    entityType: 'Game Template',
    duration: '2:42',
    uploadDate: '2024-02-05',
  },
];

const matchFootage = [
  {
    id: 101,
    title: 'Night Raid at Bridge Epsilon',
    thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400',
    source: 'Vimeo',
    url: 'https://vimeo.com/987654321',
    relatedEntity: 'BG-1846 (Beacon Game)',
    entityType: 'Beacon Game',
    duration: '43:12',
    uploadDate: '2024-10-09',
    winner: 'Phoenix',
  },
  {
    id: 102,
    title: 'Urban Assault at Tower Zeta',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
    source: 'YouTube',
    url: 'https://youtube.com/watch?v=completed123',
    relatedEntity: 'BG-1845 (Beacon Game)',
    entityType: 'Beacon Game',
    duration: '48:34',
    uploadDate: '2024-10-09',
    winner: 'Ghost',
  },
  {
    id: 103,
    title: 'Extraction at Downtown Alpha',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    source: 'Vimeo',
    url: 'https://vimeo.com/876543210',
    relatedEntity: 'BG-1844 (Beacon Game)',
    entityType: 'Beacon Game',
    duration: '35:18',
    uploadDate: '2024-10-09',
    winner: 'ShadowRunner',
  },
  {
    id: 104,
    title: 'Territory Control at Harbor Beta',
    thumbnail: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400',
    source: 'YouTube',
    url: 'https://youtube.com/watch?v=footage456',
    relatedEntity: 'BG-1842 (Beacon Game)',
    entityType: 'Beacon Game',
    duration: '52:45',
    uploadDate: '2024-10-08',
    winner: 'Vortex',
  },
  {
    id: 105,
    title: 'Shadow Protocol at Industrial Gamma',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
    source: 'Vimeo',
    url: 'https://vimeo.com/765432109',
    relatedEntity: 'BG-1841 (Beacon Game)',
    entityType: 'Beacon Game',
    duration: '28:56',
    uploadDate: '2024-10-08',
    winner: 'Cipher',
  },
  {
    id: 106,
    title: 'Urban Assault at Downtown Alpha',
    thumbnail: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=400',
    source: 'YouTube',
    url: 'https://youtube.com/watch?v=footage789',
    relatedEntity: 'BG-1840 (Beacon Game)',
    entityType: 'Beacon Game',
    duration: '41:23',
    uploadDate: '2024-10-08',
    winner: 'Raven',
  },
];

export function ClipsMediaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('explainer');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClip, setSelectedClip] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    url: '',
  });

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
      title: clip.title,
      url: clip.url,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    toast.success('Clip updated successfully', {
      description: `${editForm.title} has been updated.`,
    });
    setIsEditDialogOpen(false);
    setSelectedClip(null);
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setSelectedClip(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white mb-2">Clips & Media</h1>
        <p className="text-gray-400">Manage explainer clips and match footage</p>
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

      {/* Tabs for Clip Types */}
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
                  <img
                    src={clip.thumbnail}
                    alt={clip.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-[#00d9ff]/90 text-black">
                      <Video className="h-3 w-3 mr-1" />
                      {clip.source}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-black/80 text-white">{clip.duration}</Badge>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-[#00d9ff] flex items-center justify-center shadow-[0_0_20px_rgba(0,217,255,0.6)]">
                      <Play className="h-6 w-6 text-black ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white mb-2 line-clamp-1">{clip.title}</h3>
                  <div className="flex items-start gap-2 mb-3">
                    <FileCode className="h-4 w-4 text-[#00d9ff] mt-0.5 flex-shrink-0" />
                    <p className="text-gray-400 text-sm line-clamp-2">{clip.relatedEntity}</p>
                  </div>
                  <p className="text-gray-500 text-xs mb-3">Uploaded: {clip.uploadDate}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(clip)}
                    className="w-full border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
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
                  <img
                    src={clip.thumbnail}
                    alt={clip.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-[#ff00ff]/90 text-black">
                      <Video className="h-3 w-3 mr-1" />
                      {clip.source}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-black/80 text-white">{clip.duration}</Badge>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-[#ff00ff] flex items-center justify-center shadow-[0_0_20px_rgba(255,0,255,0.6)]">
                      <Play className="h-6 w-6 text-black ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white mb-2 line-clamp-1">{clip.title}</h3>
                  <div className="flex items-start gap-2 mb-2">
                    <Gamepad2 className="h-4 w-4 text-[#ff00ff] mt-0.5 flex-shrink-0" />
                    <p className="text-gray-400 text-sm line-clamp-2">{clip.relatedEntity}</p>
                  </div>
                  {clip.winner && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00d9ff] to-[#ff00ff] flex items-center justify-center">
                        <span className="text-white text-xs">{clip.winner.substring(0, 2).toUpperCase()}</span>
                      </div>
                      <p className="text-[#00d9ff] text-sm">Winner: {clip.winner}</p>
                    </div>
                  )}
                  <p className="text-gray-500 text-xs mb-3">Recorded: {clip.uploadDate}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(clip)}
                    className="w-full border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Clip Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Clip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-white">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                placeholder="Enter clip title..."
              />
            </div>
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
              className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}