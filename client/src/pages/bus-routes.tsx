import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Navigation, Plus, Edit, Trash2 } from "lucide-react";
import type { BusRoute } from "@shared/schema";

export default function BusRoutesPage() {
  const { data: busRoutes = [], isLoading } = useQuery<BusRoute[]>({
    queryKey: ['/api/bus-routes'],
  });

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this bus route?')) {
      try {
        const response = await fetch(`/api/bus-routes/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to delete bus route:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Bus Routes Management
            </h1>
            <Link href="/add-bus-route">
              <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Bus Route
              </Button>
            </Link>
          </div>
          <p className="text-gray-600">
            Manage transportation routes, stops, and vehicle assignments for your institution.
          </p>
        </div>

        {/* Bus Routes Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-white/20">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Bus Routes List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {busRoutes.length === 0 ? (
              <div className="p-12 text-center">
                <Navigation className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Bus Routes Found</h3>
                <p className="text-gray-500 mb-6">
                  No bus routes have been configured yet. Create your first route.
                </p>
                <Link href="/add-bus-route">
                  <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Bus Route
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="font-semibold text-gray-700">Route Name (From - To, Bus Number)</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {busRoutes.map((route) => (
                    <TableRow key={route.id} className="border-white/20 hover:bg-white/30 transition-colors">
                      <TableCell className="font-medium text-gray-800">
                        <div className="space-y-1">
                          <div className="font-semibold text-lg text-amber-700">
                            {route.routeName}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Route:</span> {route.fromLocation} → {route.toLocation}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Bus Number:</span> {route.busNumber} | 
                            <span className="font-medium ml-2">Vehicle:</span> {route.vehicleNumber}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Driver:</span> {route.driverName} ({route.driverContactNumber})
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Stops:</span> {route.stops?.length || 0} locations
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/edit-bus-route/${route.id}`}>
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
                            onClick={() => handleDelete(route.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
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