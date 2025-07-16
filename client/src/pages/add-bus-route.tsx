import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, MapPin, Trash2 } from "lucide-react";
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { insertBusRouteSchema } from "@shared/schema";

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

export default function AddBusRoutePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stops, setStops] = useState<Stop[]>([]);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 12.907974564043526, lng: 77.57370469559991 });

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

  const createBusRouteMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/bus-routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create bus route');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bus Route Created",
        description: "The bus route has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bus-routes'] });
      setLocation('/bus-routes');
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
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

    createBusRouteMutation.mutate(busRouteData);
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
      
      // Set location immediately with loading state
      setSelectedLocation({ lat, lng, address: "🔄 Getting location address..." });
      
      // Reverse geocoding to get address using Google Geocoding API
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          setSelectedLocation({ lat, lng, address });
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
              Add Bus Route
            </h1>
          </div>
          <p className="text-gray-600">
            Create a new bus route with stops, vehicle details, and staff assignments.
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
                      <DialogContent className="max-w-4xl max-h-[85vh]">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-semibold">Select Location on Map</DialogTitle>
                          <p className="text-sm text-gray-600 mt-2">
                            🎯 <strong>Click directly on the map</strong> to select a location, or use the optional search bar below
                          </p>
                        </DialogHeader>
                        
                        <div className="space-y-4">
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
                                  onClick={handleMapClick}
                                  mapId="bus-route-map"
                                  style={{ cursor: 'crosshair' }}
                                >
                                  {selectedLocation && (
                                    <Marker 
                                      position={selectedLocation}
                                      title="Selected Location"
                                    />
                                  )}
                                </Map>
                              </APIProvider>
                            </div>
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
                              <p className="text-xs text-gray-600">
                                📍 Click anywhere on the map to select a location
                              </p>
                            </div>
                          </div>

                          {/* Selected Location Info */}
                          {selectedLocation && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                              <h4 className="font-medium text-green-900 mb-2 flex items-center">
                                ✅ Location Selected
                              </h4>
                              <p className="text-sm text-green-700 mb-3 leading-relaxed">{selectedLocation.address}</p>
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-green-600">
                                  📍 Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                                </div>
                                <Button onClick={handleSelectLocation} className="bg-green-600 hover:bg-green-700">
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
                    disabled={createBusRouteMutation.isPending}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                  >
                    {createBusRouteMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Save Bus Route
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