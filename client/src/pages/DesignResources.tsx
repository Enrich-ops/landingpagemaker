import { useState, useMemo } from 'react';
import { Search, ExternalLink, Tag, Bookmark, BookmarkCheck, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { designResources, categoryLabels, tagLabels, type ResourceCategory, type ResourceTag } from '@/data/designResources';

export default function DesignResources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<ResourceTag | 'all'>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('bookmarkedResources') || '[]'))
  );

  const toggleBookmark = (id: string) => {
    const newBookmarks = new Set(bookmarkedIds);
    if (newBookmarks.has(id)) {
      newBookmarks.delete(id);
    } else {
      newBookmarks.add(id);
    }
    setBookmarkedIds(newBookmarks);
    localStorage.setItem('bookmarkedResources', JSON.stringify(Array.from(newBookmarks)));
  };

  const filteredResources = useMemo(() => {
    return designResources.filter(resource => {
      const matchesSearch = 
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.bestFor.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
      const matchesTag = selectedTag === 'all' || resource.tags.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [searchQuery, selectedCategory, selectedTag]);

  const bookmarkedResources = useMemo(() => {
    return designResources.filter(r => bookmarkedIds.has(r.id));
  }, [bookmarkedIds]);

  const allTags = useMemo(() => {
    const tags = new Set<ResourceTag>();
    designResources.forEach(r => r.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, []);

  const ResourceCard = ({ resource }: { resource: typeof designResources[0] }) => {
    const isBookmarked = bookmarkedIds.has(resource.id);

    return (
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">{resource.name}</h3>
              {resource.isPremium && (
                <Badge variant="secondary" className="text-xs">Premium</Badge>
              )}
            </div>
            {resource.collectionSize && (
              <p className="text-sm text-muted-foreground">{resource.collectionSize}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleBookmark(resource.id)}
              className="shrink-0"
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="shrink-0"
            >
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>

        <div className="mb-3">
          <p className="text-sm font-medium mb-1">Best for:</p>
          <p className="text-sm text-muted-foreground">{resource.bestFor}</p>
        </div>

        {resource.features.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium mb-2">Features:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {resource.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{feature}</span>
                </li>
              ))}
              {resource.features.length > 3 && (
                <li className="text-xs text-muted-foreground italic">
                  +{resource.features.length - 3} more features
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs">
            {categoryLabels[resource.category]}
          </Badge>
          {resource.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tagLabels[tag]}
            </Badge>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-2">Design Resources Library</h1>
          <p className="text-muted-foreground">
            Curated collection of design inspiration sources, tools, and extensions for building high-converting landing pages
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ResourceCategory | 'all')}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTag} onValueChange={(v) => setSelectedTag(v as ResourceTag | 'all')}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Tag className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tagLabels[tag]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All Resources ({filteredResources.length})
            </TabsTrigger>
            <TabsTrigger value="bookmarked">
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmarked ({bookmarkedResources.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {filteredResources.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No resources found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarked">
            {bookmarkedResources.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No bookmarked resources yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click the bookmark icon on any resource to save it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarkedResources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
