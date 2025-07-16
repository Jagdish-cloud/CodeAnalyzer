import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Calendar, Edit, Eye, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PublicHoliday } from '@shared/schema';

export default function PublicHolidays() {
  const [, navigate] = useLocation();

  const { data: holidays = [], isLoading } = useQuery<PublicHoliday[]>({
    queryKey: ['/api/public-holidays'],
    queryFn: async () => {
      const response = await fetch('/api/public-holidays');
      if (!response.ok) throw new Error('Failed to fetch holidays');
      return response.json();
    },
  });

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this holiday?')) {
      try {
        const response = await fetch(`/api/public-holidays/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to delete holiday:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Public Holiday & Vacation Master
            </h1>
            <Button
              onClick={() => navigate('/add-public-holiday')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Holiday
            </Button>
          </div>
          <p className="text-gray-600">
            Manage school holidays and vacation periods for your institution.
          </p>
        </div>

        {/* Holidays Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-white/20">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Holidays List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {holidays.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Holidays Found</h3>
                <p className="text-gray-500 mb-6">
                  Get started by adding your first holiday or vacation period.
                </p>
                <Button
                  onClick={() => navigate('/add-public-holiday')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Holiday
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">Holiday Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                    <TableHead className="font-semibold text-gray-700">Year</TableHead>
                    <TableHead className="text-center font-semibold text-gray-700 w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.map((holiday) => (
                    <TableRow key={holiday.id} className="hover:bg-white/50">
                      <TableCell className="font-medium text-gray-900">
                        {holiday.holidayDescription}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs",
                            holiday.holidayType === 'full_day' 
                              ? "bg-red-100 text-red-700 border-red-200" 
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          )}
                        >
                          {holiday.holidayType === 'full_day' ? 'Full Day' : 'Half Day'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(holiday.fromDate).toLocaleDateString()}
                        {holiday.fromDate !== holiday.toDate && (
                          <span> - {new Date(holiday.toDate).toLocaleDateString()}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {holiday.holidayYear}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600"
                            onClick={() => navigate(`/view-public-holiday/${holiday.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-50 hover:bg-green-100 border-green-200 text-green-600"
                            onClick={() => navigate(`/edit-public-holiday/${holiday.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                            onClick={() => handleDelete(holiday.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}