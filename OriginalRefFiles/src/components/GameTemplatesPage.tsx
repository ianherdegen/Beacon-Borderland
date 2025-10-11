import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, Plus, Eye, Edit, Play, Users, Calendar, Video, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner';

const gameTemplates = [
  {
    id: 1,
    name: 'Urban Assault',
    type: 'Group',
    thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400',
    explainerClip: 'https://vimeo.com/123456789',
    usageCount: 247,
    createdDate: '2024-01-10',
    description: 'High-intensity team-based combat in urban environments. Players must capture and hold strategic locations while eliminating opponents.',
    duration: '30-45 min',
    minPlayers: 6,
    maxPlayers: 12,
  },
  {
    id: 2,
    name: 'Shadow Protocol',
    type: 'Solo',
    thumbnail: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=400',
    explainerClip: 'https://youtube.com/watch?v=abc123',
    usageCount: 215,
    createdDate: '2024-01-15',
    description: 'Stealth-based solo competition. Players must complete objectives without being detected while avoiding or eliminating other players.',
    duration: '20-30 min',
    minPlayers: 4,
    maxPlayers: 8,
  },
  {
    id: 3,
    name: 'Territory Control',
    type: 'Versus',
    thumbnail: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400',
    explainerClip: 'https://vimeo.com/789012345',
    usageCount: 198,
    createdDate: '2024-01-18',
    description: 'Teams battle for control of key zones. Hold territories to earn points and secure victory through strategic positioning.',
    duration: '40-60 min',
    minPlayers: 6,
    maxPlayers: 16,
  },
  {
    id: 4,
    name: 'Night Raid',
    type: 'Group',
    thumbnail: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=400',
    explainerClip: 'https://youtube.com/watch?v=xyz789',
    usageCount: 189,
    createdDate: '2024-01-22',
    description: 'Night-time operations requiring teamwork and coordination. Complete objectives under cover of darkness while managing limited visibility.',
    duration: '35-50 min',
    minPlayers: 8,
    maxPlayers: 12,
  },
  {
    id: 5,
    name: 'Extraction',
    type: 'Versus',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    explainerClip: 'https://vimeo.com/456789012',
    usageCount: 176,
    createdDate: '2024-02-01',
    description: 'High-stakes extraction mission. One team must reach the extraction point while the other tries to prevent their escape.',
    duration: '25-40 min',
    minPlayers: 6,
    maxPlayers: 10,
  },
  {
    id: 6,
    name: 'King of the Hill',
    type: 'Group',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400',
    explainerClip: 'https://youtube.com/watch?v=def456',
    usageCount: 164,
    createdDate: '2024-02-05',
    description: 'Classic king of the hill gameplay. Hold the central position for as long as possible while fending off challengers.',
    duration: '30-45 min',
    minPlayers: 4,
    maxPlayers: 12,
  },
  {
    id: 7,
    name: 'Survival Hunt',
    type: 'Solo',
    thumbnail: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=400',
    explainerClip: 'https://vimeo.com/234567890',
    usageCount: 152,
    createdDate: '2024-02-10',
    description: 'Last player standing wins. Scavenge for resources and eliminate opponents in an ever-shrinking play area.',
    duration: '45-60 min',
    minPlayers: 8,
    maxPlayers: 20,
  },
  {
    id: 8,
    name: 'Sabotage',
    type: 'Versus',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
    explainerClip: 'https://youtube.com/watch?v=ghi789',
    usageCount: 143,
    createdDate: '2024-02-15',
    description: 'Asymmetric gameplay where one team defends objectives while the other attempts to sabotage and destroy them.',
    duration: '30-40 min',
    minPlayers: 6,
    maxPlayers: 12,
  },
];

export function GameTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof gameTemplates[0] | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<typeof gameTemplates[0] | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'Solo',
    description: '',
    thumbnail: '',
    explainerClip: '',
  });
  const [addForm, setAddForm] = useState({
    name: '',
    type: 'Solo',
    description: '',
    thumbnail: '',
    explainerClip: '',
  });

  const filteredTemplates = gameTemplates.filter((template) => {
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleEditClick = (template: typeof gameTemplates[0], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTemplate(template);
    setEditForm({
      name: template.name,
      type: template.type,
      description: template.description,
      thumbnail: template.thumbnail,
      explainerClip: template.explainerClip,
    });
    setIsEditDialogOpen(true);
    setSelectedTemplate(null);
  };

  const handleSaveEdit = () => {
    // In a real app, this would make an API call to update the template
    toast.success('Template updated successfully', {
      description: `${editForm.name} has been updated.`,
    });
    setIsEditDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleSaveAdd = () => {
    // Validate required fields
    if (!addForm.name || !addForm.description) {
      toast.error('Missing required fields', {
        description: 'Please fill in template name and description.',
      });
      return;
    }

    // In a real app, this would make an API call to create the template
    toast.success('Template created successfully', {
      description: `${addForm.name} has been added to your templates.`,
    });
    setIsAddDialogOpen(false);
    setAddForm({
      name: '',
      type: 'Solo',
      description: '',
      thumbnail: '',
      explainerClip: '',
    });
  };

  const handleCancelAdd = () => {
    setIsAddDialogOpen(false);
    setAddForm({
      name: '',
      type: 'Solo',
      description: '',
      thumbnail: '',
      explainerClip: '',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white mb-2">Game Templates</h1>
        <p className="text-gray-400">Manage game templates and rules</p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-gray-900 border-gray-800">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search game templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              className={
                filterType === 'all'
                  ? 'bg-[#00d9ff] text-black hover:bg-[#00d9ff]/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            >
              All
            </Button>
            <Button
              variant={filterType === 'Solo' ? 'default' : 'outline'}
              onClick={() => setFilterType('Solo')}
              className={
                filterType === 'Solo'
                  ? 'bg-[#00d9ff] text-black hover:bg-[#00d9ff]/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            >
              Solo
            </Button>
            <Button
              variant={filterType === 'Versus' ? 'default' : 'outline'}
              onClick={() => setFilterType('Versus')}
              className={
                filterType === 'Versus'
                  ? 'bg-[#ff00ff] text-black hover:bg-[#ff00ff]/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            >
              Versus
            </Button>
            <Button
              variant={filterType === 'Group' ? 'default' : 'outline'}
              onClick={() => setFilterType('Group')}
              className={
                filterType === 'Group'
                  ? 'bg-green-500 text-black hover:bg-green-500/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            >
              Group
            </Button>
            <Button 
              className="bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black ml-4"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>
        </div>
      </Card>

      {/* Game Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="bg-gray-900 border-gray-800 hover:border-[#00d9ff]/50 transition-all group overflow-hidden cursor-pointer"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
              <div className="absolute top-2 right-2">
                <Badge
                  className={
                    template.type === 'Solo'
                      ? 'bg-[#00d9ff]/90 text-black'
                      : template.type === 'Versus'
                      ? 'bg-[#ff00ff]/90 text-black'
                      : 'bg-green-500/90 text-black'
                  }
                >
                  {template.type}
                </Badge>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-[#00d9ff]/90 flex items-center justify-center">
                  <Play className="h-6 w-6 text-black ml-1" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-white mb-2">{template.name}</h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{template.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{template.createdDate}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTemplate(template);
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                  onClick={(e) => handleEditClick(template, e)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Template Detail Dialog */}
      <Dialog open={selectedTemplate !== null} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-3xl text-white">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white text-2xl">{selectedTemplate.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Thumbnail with Play Overlay */}
                <div className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer">
                  <img
                    src={selectedTemplate.thumbnail}
                    alt={selectedTemplate.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-[#00d9ff] flex items-center justify-center mx-auto mb-2">
                        <Play className="h-8 w-8 text-black ml-1" />
                      </div>
                      <p className="text-white">Play Explainer Clip</p>
                      <p className="text-gray-300 text-sm mt-1">
                        <Video className="inline h-3 w-3 mr-1" />
                        {selectedTemplate.explainerClip.includes('vimeo') ? 'Vimeo' : 'YouTube'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-4">
                  <Card className="p-4 bg-gray-950 border-gray-800">
                    <p className="text-gray-400 text-sm mb-1">Type</p>
                    <Badge
                      className={
                        selectedTemplate.type === 'Solo'
                          ? 'bg-[#00d9ff]/20 text-[#00d9ff] border-[#00d9ff]/50'
                          : selectedTemplate.type === 'Versus'
                          ? 'bg-[#ff00ff]/20 text-[#ff00ff] border-[#ff00ff]/50'
                          : 'bg-green-500/20 text-green-400 border-green-500/50'
                      }
                    >
                      {selectedTemplate.type}
                    </Badge>
                  </Card>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-white mb-2">Description</h3>
                  <p className="text-gray-400">{selectedTemplate.description}</p>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Created on {selectedTemplate.createdDate}</span>
                </div>

                {/* Actions */}
                <div className="pt-4">
                  <Button 
                    className="w-full bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black"
                    onClick={() => handleEditClick(selectedTemplate)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Template
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleCancelEdit}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-3xl text-white max-h-[90vh] overflow-y-auto">
          {editingTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white text-2xl">Edit Template</DialogTitle>
                <p className="text-gray-400 text-sm mt-2">Update template details and configuration</p>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Template Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Template Name</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                    placeholder="Enter template name..."
                  />
                </div>

                {/* Game Type */}
                <div className="space-y-3">
                  <Label className="text-white">Game Type</Label>
                  <RadioGroup
                    value={editForm.type}
                    onValueChange={(value) => setEditForm({ ...editForm, type: value })}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div 
                        onClick={() => setEditForm({ ...editForm, type: 'Solo' })}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          editForm.type === 'Solo' 
                            ? 'bg-[#00d9ff]/20 border-[#00d9ff] shadow-[0_0_15px_rgba(0,217,255,0.3)]' 
                            : 'border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <RadioGroupItem value="Solo" id="edit-solo" className="sr-only" />
                        <Users className="h-6 w-6 mb-2 text-[#00d9ff]" />
                        <Badge className="bg-[#00d9ff]/20 text-[#00d9ff] border-[#00d9ff]/50">Solo</Badge>
                        <p className="text-gray-400 text-xs mt-2">Individual player</p>
                      </div>
                      <div 
                        onClick={() => setEditForm({ ...editForm, type: 'Versus' })}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          editForm.type === 'Versus' 
                            ? 'bg-[#ff00ff]/20 border-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.3)]' 
                            : 'border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <RadioGroupItem value="Versus" id="edit-versus" className="sr-only" />
                        <Users className="h-6 w-6 mb-2 text-[#ff00ff]" />
                        <Badge className="bg-[#ff00ff]/20 text-[#ff00ff] border-[#ff00ff]/50">Versus</Badge>
                        <p className="text-gray-400 text-xs mt-2">Competitive</p>
                      </div>
                      <div 
                        onClick={() => setEditForm({ ...editForm, type: 'Group' })}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          editForm.type === 'Group' 
                            ? 'bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
                            : 'border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <RadioGroupItem value="Group" id="edit-group" className="sr-only" />
                        <Users className="h-6 w-6 mb-2 text-green-400" />
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Group</Badge>
                        <p className="text-gray-400 text-xs mt-2">Team-based</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500 min-h-[100px]"
                    placeholder="Enter template description..."
                  />
                  <p className="text-gray-500 text-xs">Provide a detailed description to help Game Masters understand the template</p>
                </div>

                {/* Thumbnail URL */}
                <div className="space-y-2">
                  <Label htmlFor="thumbnail" className="text-white">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={editForm.thumbnail}
                    onChange={(e) => setEditForm({ ...editForm, thumbnail: e.target.value })}
                    className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  {editForm.thumbnail && (
                    <div className="mt-3">
                      <p className="text-gray-400 text-sm mb-2">Preview:</p>
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-800">
                        <img
                          src={editForm.thumbnail}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Explainer Clip URL */}
                <div className="space-y-2">
                  <Label htmlFor="explainerClip" className="text-white">Explainer Clip URL</Label>
                  <Input
                    id="explainerClip"
                    value={editForm.explainerClip}
                    onChange={(e) => setEditForm({ ...editForm, explainerClip: e.target.value })}
                    className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                    placeholder="https://vimeo.com/... or https://youtube.com/..."
                  />
                  <p className="text-gray-500 text-xs">
                    <Video className="inline h-3 w-3 mr-1" />
                    Supports Vimeo and YouTube links
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-800">
                  <Button 
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white" 
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black" 
                    onClick={handleSaveEdit}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Template Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={handleCancelAdd}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-3xl text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <Plus className="h-6 w-6 text-[#00d9ff]" />
              Create New Template
            </DialogTitle>
            <p className="text-gray-400 text-sm mt-2">Design a new game template for your Borderland competition system</p>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Template Name */}
            <div className="space-y-2">
              <Label htmlFor="add-name" className="text-white">Template Name *</Label>
              <Input
                id="add-name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                placeholder="Enter template name..."
              />
            </div>

            {/* Game Type */}
            <div className="space-y-3">
              <Label className="text-white">Game Type *</Label>
              <RadioGroup
                value={addForm.type}
                onValueChange={(value) => setAddForm({ ...addForm, type: value })}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div 
                    onClick={() => setAddForm({ ...addForm, type: 'Solo' })}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      addForm.type === 'Solo' 
                        ? 'bg-[#00d9ff]/20 border-[#00d9ff] shadow-[0_0_15px_rgba(0,217,255,0.3)]' 
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <RadioGroupItem value="Solo" id="add-solo" className="sr-only" />
                    <Users className="h-6 w-6 mb-2 text-[#00d9ff]" />
                    <Badge className="bg-[#00d9ff]/20 text-[#00d9ff] border-[#00d9ff]/50">Solo</Badge>
                    <p className="text-gray-400 text-xs mt-2">Individual player</p>
                  </div>
                  <div 
                    onClick={() => setAddForm({ ...addForm, type: 'Versus' })}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      addForm.type === 'Versus' 
                        ? 'bg-[#ff00ff]/20 border-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.3)]' 
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <RadioGroupItem value="Versus" id="add-versus" className="sr-only" />
                    <Users className="h-6 w-6 mb-2 text-[#ff00ff]" />
                    <Badge className="bg-[#ff00ff]/20 text-[#ff00ff] border-[#ff00ff]/50">Versus</Badge>
                    <p className="text-gray-400 text-xs mt-2">Competitive</p>
                  </div>
                  <div 
                    onClick={() => setAddForm({ ...addForm, type: 'Group' })}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      addForm.type === 'Group' 
                        ? 'bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <RadioGroupItem value="Group" id="add-group" className="sr-only" />
                    <Users className="h-6 w-6 mb-2 text-green-400" />
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Group</Badge>
                    <p className="text-gray-400 text-xs mt-2">Team-based</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="add-description" className="text-white">Description *</Label>
              <Textarea
                id="add-description"
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500 min-h-[120px]"
                placeholder="Describe the game template, objectives, and gameplay mechanics..."
              />
              <p className="text-gray-500 text-xs">Provide a detailed description to help Game Masters understand the template</p>
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-2">
              <Label htmlFor="add-thumbnail" className="text-white flex items-center justify-between">
                Thumbnail Image
                <span className="text-gray-500 text-xs">Optional</span>
              </Label>
              <Input
                id="add-thumbnail"
                value={addForm.thumbnail}
                onChange={(e) => setAddForm({ ...addForm, thumbnail: e.target.value })}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                placeholder="https://example.com/image.jpg"
              />
              {addForm.thumbnail && (
                <div className="mt-3">
                  <p className="text-gray-400 text-sm mb-2">Preview:</p>
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-800">
                    <img
                      src={addForm.thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400';
                      }}
                    />
                  </div>
                </div>
              )}
              <p className="text-gray-500 text-xs flex items-center gap-1">
                <Upload className="h-3 w-3" />
                Enter a URL or upload an image to represent this template
              </p>
            </div>

            {/* Explainer Clip URL */}
            <div className="space-y-2">
              <Label htmlFor="add-explainerClip" className="text-white flex items-center justify-between">
                Explainer Clip
                <span className="text-gray-500 text-xs">Optional</span>
              </Label>
              <Input
                id="add-explainerClip"
                value={addForm.explainerClip}
                onChange={(e) => setAddForm({ ...addForm, explainerClip: e.target.value })}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                placeholder="https://vimeo.com/... or https://youtube.com/..."
              />
              <p className="text-gray-500 text-xs">
                <Video className="inline h-3 w-3 mr-1" />
                Add a video link to explain the game rules and mechanics (Vimeo or YouTube)
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <Button 
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white" 
                onClick={handleCancelAdd}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black" 
                onClick={handleSaveAdd}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}