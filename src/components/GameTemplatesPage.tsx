import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, Plus, Eye, Edit, Play, Users, Video, Upload, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner';
import { GameTemplatesService } from '../services/game-templates';
import { GameTemplate } from '../types';
import { useAuth } from '../contexts/AuthContext';


export function GameTemplatesPage() {
  const { isAuthenticated } = useAuth();
  const [gameTemplates, setGameTemplates] = useState<GameTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<GameTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'Solo' as 'Solo' | 'Versus' | 'Group',
    description: '',
    thumbnail: '',
    explainerClip: '',
  });
  const [addForm, setAddForm] = useState({
    name: '',
    type: 'Solo' as 'Solo' | 'Versus' | 'Group',
    description: '',
    thumbnail: '',
    explainerClip: '',
  });

  // Fetch game templates data
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

  const fetchGameTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await GameTemplatesService.getAll();
      setGameTemplates(data);
    } catch (err) {
      console.error('Error fetching game templates:', err);
      setError('Failed to load game templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameTemplates();
  }, []);

  const filteredTemplates = gameTemplates.filter((template) => {
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleEditClick = (template: GameTemplate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTemplate(template);
    setEditForm({
      name: template.name,
      type: template.type,
      description: template.description,
      thumbnail: template.thumbnail || '',
      explainerClip: template.explainer_clip || '',
    });
    setIsEditDialogOpen(true);
    setSelectedTemplate(null);
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate) return;

    try {
      setSaving(true);
      
      const updateData = {
        name: editForm.name,
        type: editForm.type,
        description: editForm.description,
        thumbnail: editForm.thumbnail || null,
        explainer_clip: editForm.explainerClip || null,
      };

      const updatedTemplate = await GameTemplatesService.update(editingTemplate.id, updateData);
      
      // Update local state immediately
      setGameTemplates(prev => {
        const updated = prev.map(template => 
          template.id === editingTemplate.id ? updatedTemplate : template
        );
        console.log('Updated game templates after edit:', updated);
        return updated;
      });

      toast.success('Template updated successfully', {
        description: `${editForm.name} has been updated.`,
      });
      
      setIsEditDialogOpen(false);
      setEditingTemplate(null);
    } catch (err) {
      console.error('Error updating template:', err);
      toast.error('Failed to update template', {
        description: 'Please try again or check your connection.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleSaveAdd = async () => {
    // Validate required fields
    if (!addForm.name || !addForm.description) {
      toast.error('Missing required fields', {
        description: 'Please fill in template name and description.',
      });
      return;
    }

    try {
      setSaving(true);
      
      const newTemplateData = {
        name: addForm.name,
        type: addForm.type,
        description: addForm.description,
        thumbnail: addForm.thumbnail || null,
        explainer_clip: addForm.explainerClip || null,
      };

      const newTemplate = await GameTemplatesService.create(newTemplateData);
      
      // Add to local state immediately
      setGameTemplates(prev => {
        const updated = [newTemplate, ...prev];
        console.log('Updated game templates after add:', updated);
        return updated;
      });

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
    } catch (err) {
      console.error('Error creating template:', err);
      toast.error('Failed to create template', {
        description: 'Please try again or check your connection.',
      });
    } finally {
      setSaving(false);
    }
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search game templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
              />
            </div>
            {isAuthenticated && (
              <Button 
                className="bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              className={`whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-[#00d9ff] text-black hover:bg-[#00d9ff]/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              All
            </Button>
            <Button
              variant={filterType === 'Solo' ? 'default' : 'outline'}
              onClick={() => setFilterType('Solo')}
              className={`whitespace-nowrap ${
                filterType === 'Solo'
                  ? 'bg-[#00d9ff] text-black hover:bg-[#00d9ff]/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Solo
            </Button>
            <Button
              variant={filterType === 'Versus' ? 'default' : 'outline'}
              onClick={() => setFilterType('Versus')}
              className={`whitespace-nowrap ${
                filterType === 'Versus'
                  ? 'bg-[#ff00ff] text-black hover:bg-[#ff00ff]/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Versus
            </Button>
            <Button
              variant={filterType === 'Group' ? 'default' : 'outline'}
              onClick={() => setFilterType('Group')}
              className={`whitespace-nowrap ${
                filterType === 'Group'
                  ? 'bg-green-500 text-black hover:bg-green-500/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Group
            </Button>
          </div>
        </div>
      </Card>

      {/* Game Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#00d9ff]" />
          <span className="ml-2 text-gray-400">Loading game templates...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="bg-gray-900 border-gray-800 hover:border-[#00d9ff]/50 transition-all group overflow-hidden cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={template.thumbnail || 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400'}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400';
                  }}
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
                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                      onClick={(e) => handleEditClick(template, e)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Template Detail Dialog */}
      <Dialog open={selectedTemplate !== null} onOpenChange={() => {
        setSelectedTemplate(null);
        setPlayingVideo(null);
      }}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-3xl text-white">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white text-2xl">{selectedTemplate.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Thumbnail with Play Overlay or Video Player */}
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  {selectedTemplate.explainer_clip && playingVideo === selectedTemplate.id ? (
                    <>
                      <iframe
                        src={getEmbedUrl(selectedTemplate.explainer_clip)}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`${selectedTemplate.name} Explainer Clip`}
                      />
                      <button
                        onClick={() => setPlayingVideo(null)}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <img
                        src={selectedTemplate.thumbnail || 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400'}
                        alt={selectedTemplate.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400';
                        }}
                      />
                      {selectedTemplate.explainer_clip && (
                        <div 
                          className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors cursor-pointer"
                          onClick={() => setPlayingVideo(selectedTemplate.id)}
                        >
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-[#00d9ff] flex items-center justify-center mx-auto mb-2">
                              <Play className="h-8 w-8 text-black ml-1" />
                            </div>
                            <p className="text-white">Play Explainer Clip</p>
                            <p className="text-gray-300 text-sm mt-1">
                              <Video className="inline h-3 w-3 mr-1" />
                              {selectedTemplate.explainer_clip.includes('vimeo') ? 'Vimeo' : 'YouTube'}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
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


                {/* Actions */}
                <div className="pt-4">
                  {isAuthenticated && (
                    <Button 
                      className="w-full bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black"
                      onClick={() => handleEditClick(selectedTemplate)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Template
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      {isAuthenticated && (
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
                  <p className="text-gray-500 text-xs">Recommended image size: 400x300px</p>
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
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black disabled:opacity-50" 
                    onClick={handleSaveEdit}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
        </Dialog>
      )}

      {/* Add Template Dialog */}
      {isAuthenticated && (
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
              <p className="text-gray-500 text-xs">Recommended image size: 400x300px</p>
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
                Enter a URL to represent this template
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
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black disabled:opacity-50" 
                onClick={handleSaveAdd}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
        </Dialog>
      )}
    </div>
  );
}