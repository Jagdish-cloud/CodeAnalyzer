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

// Custom form schema that excludes auto-generated fields
const formSchema = insertBusRouteSchema.omit({
  fromLocation: true,
  toLocation: true,
  busNumber: true,
  stops: true,
});
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
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/bus-routes/${busRouteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
    if (stops.length < 2) {
      toast({
        title: "Insufficient Stops",
        description: "Please select at least 2 stops to create a route (starting and ending locations).",
        variant: "destructive",
      });
      return;
    }

    // Auto-derive route information from selected stops
    const fromLocation = stops[0].address;
    const toLocation = stops[stops.length - 1].address;
    const busNumber = `BUS-${values.routeNumber}`;

    const busRouteData = {
      ...values,
      fromLocation,
      toLocation,
      busNumber,
      stops,
    };

    updateBusRouteMutation.mutate(busRouteData);
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

  const handleMapClick = (event: any) => {
    console.log('handleMapClick called with event:', event);
    
    if (event && event.detail && event.detail.latLng) {
      const lat = event.detail.latLng.lat;
      const lng = event.detail.latLng.lng;
      
      console.log('Extracted coordinates:', { lat, lng });
      
      // Set location immediately with loading state
      setSelectedLocation({ lat, lng, address: "🔄 Getting location address..." });
      
      // Reverse geocoding to get address using Google Geocoding API
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        console.log('Geocoding result:', { status, results });
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          setSelectedLocation({ lat, lng, address });
          toast({
            title: "Location selected",
            description: "Address found successfully!",
          });
        } else {
          // Fallback with coordinates if geocoding fails
          setSelectedLocation({ 
            lat, 
            lng, 
            address: `📍 Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}` 
          });
          toast({
            title: "Address lookup failed",
            description: "Using coordinates instead. Location will still work correctly.",
            variant: "destructive",
          });
        }
      });
    } else if (event && event.latLng) {
      // Fallback for different event structure
      const lat = typeof event.latLng.lat === 'function' ? event.latLng.lat() : event.latLng.lat;
      const lng = typeof event.latLng.lng === 'function' ? event.latLng.lng() : event.latLng.lng;
      
      console.log('Fallback coordinates extraction:', { lat, lng });
      
      setSelectedLocation({ lat, lng, address: "🔄 Getting location address..." });
      
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          setSelectedLocation({ lat, lng, address });
          toast({
            title: "Location selected",
            description: "Address found successfully!",
          });
        } else {
          setSelectedLocation({ 
            lat, 
            lng, 
            address: `📍 Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}` 
          });
        }
      });
    } else {
      console.log('No valid coordinates found in event:', event);
      toast({
        title: "Map click not detected",
        description: "Please try clicking again on the map.",
        variant: "destructive",
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

                {/* Route Information Display */}
                {stops.length > 0 && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-amber-800 mb-4">Route Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/60 rounded-lg p-4">
                        <h4 className="font-medium text-amber-700 mb-2">From Location</h4>
                        <p className="text-sm text-gray-700">{stops[0]?.address || "Not selected"}</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-4">
                        <h4 className="font-medium text-amber-700 mb-2">To Location</h4>
                        <p className="text-sm text-gray-700">{stops[stops.length - 1]?.address || "Not selected"}</p>
                      </div>
                      <div className="bg-white/60 rounded-lg p-4">
                        <h4 className="font-medium text-amber-700 mb-2">Auto Bus Number</h4>
                        <p className="text-sm text-gray-700">
                          {form.watch('routeNumber') ? `BUS-${form.watch('routeNumber')}` : "Will generate after route number"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 bg-white/60 rounded-lg p-4">
                      <h4 className="font-medium text-amber-700 mb-2">Total Stops</h4>
                      <p className="text-sm text-gray-700">{stops.length} locations selected</p>
                    </div>
                  </div>
                )}

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
                      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
                        <DialogHeader className="flex-shrink-0">
                          <DialogTitle className="text-lg font-semibold">Select Location on Map</DialogTitle>
                          <p className="text-sm text-gray-600 mt-2">
                            🎯 <strong>Drag the map</strong> to navigate, <strong>click to select a location</strong>, then <strong>drag the marker</strong> to fine-tune the position, or use the optional search bar below
                          </p>
                        </DialogHeader>
                        
                        <div className="space-y-4 overflow-y-auto max-h-[calc(85vh-120px)] pr-2 flex-1">
                          {/* Optional Search Section */}
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">🔍 Optional: Search for Location</h4>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Type location name (e.g., MG Road Bangalore)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-white"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                              />
                              <Button onClick={handleSearch} type="button" variant="outline">
                                Search
                              </Button>
                            </div>
                          </div>

                          {/* Google Maps - Primary Interaction */}
                          <div className="relative">
                            <div className="h-[400px] border-2 border-amber-200 rounded-lg overflow-hidden shadow-lg">
                              <APIProvider apiKey="AIzaSyBujSZvWEnauXhd-bJQ7wjD2rho1qKUwf8">
                                <Map
                                  defaultZoom={13}
                                  center={mapCenter}
                                  onClick={(e) => {
                                    console.log('Map clicked:', e);
                                    handleMapClick(e);
                                  }}
                                  mapId="bus-route-edit-map"
                                  gestureHandling="greedy"
                                  disableDefaultUI={false}
                                  clickableIcons={false}
                                  options={{
                                    draggable: true,
                                    zoomControl: true,
                                    scrollwheel: true,
                                    disableDoubleClickZoom: false,
                                    keyboardShortcuts: true,
                                    panControl: true,
                                    rotateControl: false,
                                    scaleControl: true,
                                    streetViewControl: false,
                                    fullscreenControl: true
                                  }}
                                  style={{ 
                                    cursor: 'grab',
                                    width: '100%',
                                    height: '100%'
                                  }}
                                >
                                  {selectedLocation && (
                                    <Marker 
                                      position={selectedLocation}
                                      title="Selected Location"
                                      draggable={true}
                                      onDragEnd={(e) => {
                                        console.log('Marker dragged:', e);
                                        if (e.latLng) {
                                          const lat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
                                          const lng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
                                          
                                          console.log('Drag end coordinates:', { lat, lng });
                                          
                                          // Update location with loading state
                                          setSelectedLocation({ lat, lng, address: "🔄 Getting location address..." });
                                          
                                          // Reverse geocoding for new position
                                          const geocoder = new google.maps.Geocoder();
                                          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                                            if (status === 'OK' && results && results[0]) {
                                              const address = results[0].formatted_address;
                                              setSelectedLocation({ lat, lng, address });
                                              toast({
                                                title: "Location updated",
                                                description: "Marker position updated successfully!",
                                              });
                                            } else {
                                              setSelectedLocation({ 
                                                lat, 
                                                lng, 
                                                address: `📍 Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}` 
                                              });
                                            }
                                          });
                                        }
                                      }}
                                    />
                                  )}
                                </Map>
                              </APIProvider>
                            </div>
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
                              <p className="text-xs text-gray-600">
                                🗺️ Drag map to navigate • 📍 Click to select • 🔄 Drag marker to adjust
                              </p>
                            </div>
                          </div>

                          {/* Selected Location Info */}
                          {selectedLocation && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 w-full">
                              <h4 className="font-medium text-green-900 mb-2 flex items-center">
                                ✅ Location Selected
                              </h4>
                              <p className="text-sm text-green-700 mb-3 leading-relaxed break-words">{selectedLocation.address}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="text-xs text-green-600 break-all">
                                  📍 Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                                </div>
                                <Button onClick={handleSelectLocation} className="bg-green-600 hover:bg-green-700 flex-shrink-0">
                                  Add This Stop
                                </Button>
                              </div>
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