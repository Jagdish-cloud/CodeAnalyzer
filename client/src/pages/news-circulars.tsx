import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Eye, Edit, Trash2, File, Calendar } from "lucide-react";
import type { NewsCircular } from "@shared/schema";

export default function NewsCircularsPage() {
  const { data: newsCirculars = [], isLoading } = useQuery<NewsCircular[]>({
    queryKey: ['/api/news-circulars'],
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatus = (fromDate: string, toDate: string) => {
    const today = new Date();
    const start = new Date(fromDate);
    const end = new Date(toDate);
    
    if (today >= start && today <= end) {
      return { status: 'Active', color: 'bg-green-100 text-green-700' };
    } else if (today > end) {
      return { status: 'Expired', color: 'bg-red-100 text-red-700' };
    } else {
      return { status: 'Scheduled', color: 'bg-blue-100 text-blue-700' };
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'Flash News':
        return 'bg-orange-100 text-orange-700';
      case 'School News':
        return 'bg-blue-100 text-blue-700';
      case 'Notice & Circular':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTitleText = (newsCircular: NewsCircular) => {
    if (newsCircular.eventType === 'Flash News') {
      return newsCircular.text || '';
    } else {
      return newsCircular.title || '';
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this news/circular?')) {
      try {
        const response = await fetch(`/api/news-circulars/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to delete news/circular:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Flash News / School News / Circular Screen
            </h1>
            <Link href="/add-news-circular">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </Link>
          </div>
          <p className="text-gray-600">
            Manage flash news, school news, and circular announcements for the institution.
          </p>
        </div>

        {/* News/Circulars Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-white/20">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              News & Circulars
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {newsCirculars.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No News or Circulars</h3>
                <p className="text-gray-500 mb-6">
                  No news or circulars have been created yet. Create your first announcement.
                </p>
                <Link href="/add-news-circular">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Announcement
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="font-semibold text-gray-700">Type of Event</TableHead>
                    <TableHead className="font-semibold text-gray-700">Title/Text</TableHead>
                    <TableHead className="font-semibold text-gray-700">From Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">To Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsCirculars.map((newsCircular) => {
                    const status = getStatus(newsCircular.fromDate, newsCircular.toDate);
                    return (
                      <TableRow key={newsCircular.id} className="border-white/20 hover:bg-white/30 transition-colors">
                        <TableCell>
                          <Badge variant="secondary" className={getEventTypeColor(newsCircular.eventType)}>
                            {newsCircular.eventType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-gray-800 max-w-xs">
                          <div className="truncate" title={getTitleText(newsCircular)}>
                            {getTitleText(newsCircular)}
                          </div>
                          {newsCircular.fileName && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                              <File className="h-3 w-3" />
                              {newsCircular.fileName}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(newsCircular.fromDate)}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(newsCircular.toDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={status.color}>
                            {status.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white/50 hover:bg-white/70 border-white/20"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Link href={`/edit-news-circular/${newsCircular.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(newsCircular.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}