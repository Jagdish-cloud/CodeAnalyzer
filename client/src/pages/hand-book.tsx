import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Trash2, Plus } from "lucide-react";
import type { HandBook } from "@shared/schema";

export default function HandBookPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const { data: handBooks = [], isLoading } = useQuery<HandBook[]>({
    queryKey: ['/api/handbooks', selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/handbooks/year/${selectedYear}`);
      if (!response.ok) throw new Error('Failed to fetch handbooks');
      return response.json();
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return <FileText className="h-8 w-8 text-blue-500" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
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
              Hand Book Management
            </h1>
            <Link href="/add-hand-book">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Hand Book
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-48 bg-white/70 backdrop-blur-sm border-white/20">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027, 2028].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="bg-white/70 text-gray-700">
              {handBooks.length} file{handBooks.length !== 1 ? 's' : ''} found for {selectedYear}
            </Badge>
          </div>
        </div>

        {/* Hand Books Grid */}
        {handBooks.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Hand Books Found</h3>
              <p className="text-gray-500 mb-6">
                No hand books have been uploaded for {selectedYear} yet.
              </p>
              <Link href="/add-hand-book">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload First Hand Book
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {handBooks.map((handBook) => (
              <Card key={handBook.id} className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getFileIcon(handBook.fileName)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {handBook.fileName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Year: {handBook.year}</span>
                          <span>Size: {formatFileSize(handBook.fileSize)}</span>
                          <span>Uploaded: {formatDate(handBook.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/50 hover:bg-white/70 border-white/20"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `/uploads/${handBook.filePath.split('/').pop()}`;
                          link.download = handBook.fileName;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600 hover:text-red-700"
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this hand book?')) {
                            try {
                              const response = await fetch(`/api/handbooks/${handBook.id}`, {
                                method: 'DELETE',
                              });
                              if (response.ok) {
                                window.location.reload();
                              }
                            } catch (error) {
                              console.error('Failed to delete hand book:', error);
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}