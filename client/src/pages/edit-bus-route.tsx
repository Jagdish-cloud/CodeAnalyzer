import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, MapPin, Trash2, Save } from "lucide-react";
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { insertBusRouteSchema } from "@shared/schema";
import type { BusRoute } from "@shared/schema";

const formSchema = insertBusRouteSchema;
type FormValues = z.infer<typeof formSchema>;

interface Stop {
  address: string;
  lat: number;
  lng: number;
}

export default function EditBusRoutePage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stops, setStops] = useState<Stop[]>([]);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 12.907974564043526, lng: 77.57370469559991 });

  const busRouteId = parseInt(params?.id || "0");

  const { data: busRoute, isLoading } = useQuery<BusRoute>({
    queryKey: ['/api/bus-routes', busRouteId],
    enabled: !!busRouteId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      routeNumber: "",
      routeName: "",
      fromLocation: "",
      toLocation: "",
      busNumber: "",
      stops: [],
      vehicleNumber: "",
      driverName: "",
      driverContactNumber: "",
      busAttenderName: "",
      busAttenderContactNumber: "",
    },
  });

  useEffect(() => {
    if (busRoute) {
      form.reset({
        routeNumber: busRoute.routeNumber,
        routeName: busRoute.routeName,
        fromLocation: busRoute.fromLocation,
        toLocation: busRoute.toLocation,
        busNumber: busRoute.busNumber,
        stops: busRoute.stops || [],
        vehicleNumber: busRoute.vehicleNumber,
        driverName: busRoute.driverName,
        driverContactNumber: busRoute.driverContactNumber,
        busAttenderName: busRoute.busAttenderName,
        busAttenderContactNumber: busRoute.busAttenderContactNumber,
      });
      setStops(busRoute.stops || []);
    }
  }, [busRoute, form]);

  const updateBusRouteMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const busRouteData = {
        ...data,
        stops,
      };

      const response = await fetch(`/api/bus-routes/${busRouteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(busRouteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update bus route');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bus Route Updated",
        description: "The bus route has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bus-routes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bus-routes', busRouteId] });
      setLocation('/bus-routes');
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    updateBusRouteMutation.mutate(values);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          const address = results[0].formatted_address;
          
          setMapCenter({ lat, lng });
          setSelectedLocation({ lat, lng, address });
        } else {
          toast({
            title: "Location Not Found",
            description: "Please try a different search term.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search location. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      // Reverse geocoding to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          setSelectedLocation({ lat, lng, address });
        }
      });
    }
  };

  const handleSelectLocation = () => {
    if (selectedLocation) {
      setStops([...stops, selectedLocation]);
      setSelectedLocation(null);
      setSearchQuery("");
      setIsMapDialogOpen(false);
      toast({
        title: "Stop Added",
        description: "Location has been added to the route stops.",
      });
    }
  };

  const handleDeleteStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
    toast({
      title: "Stop Removed",
      description: "Location has been removed from the route stops.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!busRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-600">Bus Route Not Found</h1>
            <Link href="/bus-routes">
              <Button className="mt-4">Back to Bus Routes</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/bus-routes">
              <Button variant="outline" size="sm" className="bg-white/70 backdrop-blur-sm border-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bus Routes
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Edit Bus Route
            </h1>
          </div>
          <p className="text-gray-600">
            Update bus route details, stops, vehicle information, and staff assignments.
          </p>
        </div>

        {/* Form Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-white/20">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Bus Route Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Route Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="routeNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Route Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter route number..."
                            className="bg-white/50 border-white/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="routeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Route Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter route name..."
                            className="bg-white/50 border-white/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* From and To with Bus Number */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="fromLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">From Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Starting location..."
                            className="bg-white/50 border-white/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">To Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ending location..."
                            className="bg-white/50 border-white/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="busNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Bus Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Bus number..."
                            className="bg-white/50 border-white/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Add Stops Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-700">Route Stops</h3>
                    
                    <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="bg-white/50 hover:bg-white/70 border-white/20"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Stops
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Select Location on Map</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {/* Search Section */}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Search for a location..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="flex-1"
                              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} type="button">
                              Search
                            </Button>
                          </div>

                          {/* Google Maps */}
                          <div className="h-96 border rounded-lg overflow-hidden">
                            <APIProvider apiKey="AIzaSyBujSZvWEnauXhd-bJQ7wjD2rho1qKUwf8">
                              <Map
                                defaultZoom={13}
                                center={mapCenter}
                                onClick={handleMapClick}
                                mapId="bus-route-edit-map"
                              >
                                {selectedLocation && (
                                  <Marker position={selectedLocation} />
                                )}
                              </Map>
                            </APIProvider>
                          </div>

                          {/* Selected Location Info */}
                          {selectedLocation && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h4 className="font-medium text-green-900 mb-2">Selected Location</h4>
                              <p className="text-sm text-green-700 mb-3">{selectedLocation.address}</p>
                              <Button onClick={handleSelectLocation} className="bg-green-600 hover:bg-green-700">
                                Select This Location
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Stops Table */}
                  {stops.length > 0 && (
                    <Card className="bg-white/50">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Address</TableHead>
                              <TableHead className="text-center w-24">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stops.map((stop, index) => (
                              <TableRow key={index}>
                                <TableCell className="text-sm">{stop.address}</TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteStop(index)}
                                    className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Vehicle and Staff Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="vehicleNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Vehicle Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Registration number..."
                            className="bg-white/50 border-white/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="driverName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Driver Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Driver name..."
                            className="bg-white/50 border-white/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="driverContactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Driver Contact Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Driver mobile number..."
                            className="bg-white/50 border-white/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="busAttenderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Bus Attender Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Attender name..."
                            className="bg-white/50 border-white/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="busAttenderContactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Bus Attender Contact Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Attender mobile number..."
                            className="bg-white/50 border-white/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-white/20">
                  <Link href="/bus-routes">
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-white/50 hover:bg-white/70 border-white/20"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={updateBusRouteMutation.isPending}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                  >
                    {updateBusRouteMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Bus Route
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}