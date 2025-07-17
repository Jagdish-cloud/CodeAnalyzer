import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, ImageIcon, Calendar } from "lucide-react";
import type { PhotoGallery } from "@shared/schema";

export default function PhotoGalleryPage() {
  const { data: photoGalleries, isLoading } = useQuery<PhotoGallery[]>({
    queryKey: ["/api/photo-galleries"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading photo galleries...</div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sports':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'academic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cultural':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Photo Gallery
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Manage event photo galleries and memories
            </p>
          </div>
          <Link href="/add-photo-gallery">
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Add Gallery
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Galleries</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {photoGalleries?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Photos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {photoGalleries?.reduce((sum, gallery) => sum + gallery.imageCount, 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Events Types</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(photoGalleries?.map(g => g.eventType)).size || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Photos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {photoGalleries?.length ? Math.round((photoGalleries.reduce((sum, gallery) => sum + gallery.imageCount, 0) / photoGalleries.length)) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Photo Gallery Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30">
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Event Name</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Type</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Date</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Images</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {photoGalleries && photoGalleries.length > 0 ? (
                    photoGalleries.map((gallery) => (
                      <TableRow 
                        key={gallery.id} 
                        className="hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          {gallery.eventName}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getEventTypeColor(gallery.eventType)} border-0`}>
                            {gallery.eventType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-300">
                          {formatDate(gallery.eventDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-white font-medium">
                              {gallery.imageCount} photos
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full"
                              title="View Gallery"
                            >
                              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </Button>
                            <Link href={`/edit-photo-gallery/${gallery.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full"
                                title="Edit Gallery"
                              >
                                <Edit className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center space-y-3">
                          <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                          <p className="text-lg font-medium">No photo galleries found</p>
                          <p className="text-sm">Create your first photo gallery to get started</p>
                          <Link href="/add-photo-gallery">
                            <Button variant="outline" className="mt-2">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Gallery
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}