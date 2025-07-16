import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Eye, Edit, Trash2 } from "lucide-react";
import type { Event } from "@shared/schema";

export default function EventsPage() {
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDuration = (fromDate: string, toDate: string) => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 day';
    } else if (diffDays === 0) {
      return 'Same day';
    } else {
      return `${diffDays} days`;
    }
  };

  const getEventStatus = (fromDate: string, toDate: string) => {
    const today = new Date();
    const start = new Date(fromDate);
    const end = new Date(toDate);
    
    if (today < start) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-700' };
    } else if (today >= start && today <= end) {
      return { status: 'ongoing', color: 'bg-green-100 text-green-700' };
    } else {
      return { status: 'completed', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`/api/events/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Events Management
            </h1>
            <Link href="/add-event">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </Link>
          </div>
          <p className="text-gray-600">
            Manage and schedule institutional events and activities.
          </p>
        </div>

        {/* Events Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-white/20">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Event Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {events.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Scheduled</h3>
                <p className="text-gray-500 mb-6">
                  No events have been scheduled yet. Create your first event.
                </p>
                <Link href="/add-event">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule First Event
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="font-semibold text-gray-700">Event Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">From Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">To Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => {
                    const eventStatus = getEventStatus(event.fromDate, event.toDate);
                    return (
                      <TableRow key={event.id} className="border-white/20 hover:bg-white/30 transition-colors">
                        <TableCell className="font-medium text-gray-800">
                          {event.eventName}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatDate(event.fromDate)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatDate(event.toDate)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {getDuration(event.fromDate, event.toDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={eventStatus.color}>
                            {eventStatus.status}
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
                            <Link href={`/edit-event/${event.id}`}>
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
                              onClick={() => handleDelete(event.id)}
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