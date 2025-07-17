import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequestWithFormData } from "@/lib/queryClient";
import { ArrowLeft, Upload, X, Eye, CheckCircle, AlertCircle, Calendar, ImageIcon } from "lucide-react";
import type { Event, InsertPhotoGallery } from "@shared/schema";

// Form validation schema
const photoGallerySchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  eventType: z.enum(["Sports", "Academic", "Cultural", "Others"], {
    required_error: "Event type is required",
  }),
  eventDate: z.string().min(1, "Event date is required"),
  description: z.string().optional(),
});

type PhotoGalleryFormData = z.infer<typeof photoGallerySchema>;

interface PreviewImage {
  file: File;
  url: string;
  id: string;
}

export default function AddPhotoGalleryPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [isOthersSelected, setIsOthersSelected] = useState(false);
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  // Fetch events for dropdown
  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const form = useForm<PhotoGalleryFormData>({
    resolver: zodResolver(photoGallerySchema),
    defaultValues: {
      eventName: "",
      eventType: "Others",
      eventDate: "",
      description: "",
    },
  });

  // Handle event selection
  const handleEventChange = useCallback((eventId: string) => {
    setSelectedEvent(eventId);
    
    if (eventId === "others") {
      setIsOthersSelected(true);
      // Clear fields for manual entry
      form.setValue("eventName", "");
      form.setValue("eventDate", "");
      form.setValue("description", "");
    } else {
      setIsOthersSelected(false);
      // Find and auto-fill event data
      const event = events?.find(e => e.id.toString() === eventId);
      if (event) {
        form.setValue("eventName", event.eventName);
        form.setValue("eventDate", event.fromDate);
        form.setValue("description", event.notes || "");
      }
    }
  }, [events, form]);

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImages: PreviewImage[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Only image files are allowed`);
        return;
      }

      // Validate file size (2MB max as per requirements)
      if (file.size > 2 * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds 2MB limit`);
        return;
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      newImages.push({
        file,
        url: previewUrl,
        id: Math.random().toString(36).substr(2, 9),
      });
    });

    setPreviewImages(prev => [...prev, ...newImages]);
    setUploadErrors(errors);

    if (errors.length > 0) {
      toast({
        title: "Some files were rejected",
        description: errors.join(", "),
        variant: "destructive",
      });
    }
  }, [toast]);

  // Remove image from preview
  const removeImage = useCallback((id: string) => {
    setPreviewImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Revoke object URL to prevent memory leaks
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return updated;
    });
  }, []);

  // Create photo gallery mutation
  const createPhotoGalleryMutation = useMutation({
    mutationFn: async (data: PhotoGalleryFormData) => {
      const formData = new FormData();
      
      // Add form fields
      formData.append("eventName", data.eventName);
      formData.append("eventType", data.eventType);
      formData.append("eventDate", data.eventDate);
      if (data.description) {
        formData.append("description", data.description);
      }

      // Add images
      previewImages.forEach((image) => {
        formData.append("images", image.file);
      });

      return apiRequestWithFormData("/api/photo-galleries", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Photo gallery created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/photo-galleries"] });
      setLocation("/photo-gallery");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create photo gallery",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PhotoGalleryFormData) => {
    if (previewImages.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one image",
        variant: "destructive",
      });
      return;
    }

    createPhotoGalleryMutation.mutate(data);
  };

  const isFormValid = form.formState.isValid && previewImages.length > 0 && !isOthersSelected || (isOthersSelected && form.watch("eventName"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/photo-gallery")}
            className="hover:bg-white/50 dark:hover:bg-gray-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Photo Gallery
          </Button>
        </div>

        <div className="space-y-2 mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Add Photo Gallery
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Create a new photo gallery for events and memories
          </p>
        </div>

        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              Gallery Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Smart Event Selection */}
                <div className="space-y-2">
                  <Label htmlFor="event-select" className="text-sm font-medium text-gray-900 dark:text-white">
                    Select Event <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedEvent} onValueChange={handleEventChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {events?.map((event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.eventName}
                        </SelectItem>
                      ))}
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <span>Event Name</span>
                          {isOthersSelected && <span className="text-red-500">*</span>}
                          {!isOthersSelected && selectedEvent && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={isOthersSelected ? "Enter event name..." : "Auto-filled from event"}
                            {...field}
                            disabled={!isOthersSelected}
                            className={!isOthersSelected && selectedEvent ? "bg-green-50 dark:bg-green-900/20" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Academic">Academic</SelectItem>
                            <SelectItem value="Cultural">Cultural</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Event Date</span>
                          <span className="text-red-500">*</span>
                          {!isOthersSelected && selectedEvent && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            disabled={!isOthersSelected}
                            className={!isOthersSelected && selectedEvent ? "bg-green-50 dark:bg-green-900/20" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div></div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span>Description</span>
                        <span className="text-gray-400 text-sm">(Optional)</span>
                        {!isOthersSelected && selectedEvent && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={isOthersSelected ? "Enter event description..." : "Auto-filled from event"}
                          {...field}
                          rows={3}
                          disabled={!isOthersSelected}
                          className={!isOthersSelected && selectedEvent ? "bg-green-50 dark:bg-green-900/20" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Multi-Image Upload */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Upload Images <span className="text-red-500">*</span>
                    <span className="text-gray-500 text-xs ml-2">(Max 2MB per image)</span>
                  </Label>
                  
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Drag and drop images here, or click to browse
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Images
                    </Button>
                  </div>

                  {/* Image Previews */}
                  {previewImages.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Selected Images ({previewImages.length})
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            previewImages.forEach(img => URL.revokeObjectURL(img.url));
                            setPreviewImages([]);
                          }}
                        >
                          Clear All
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {previewImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                              <img
                                src={image.url}
                                alt="Preview"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(image.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Errors */}
                  {uploadErrors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                            Upload Errors
                          </h4>
                          <ul className="text-sm text-red-700 dark:text-red-300 mt-1 space-y-1">
                            {uploadErrors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/photo-gallery")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isFormValid || createPhotoGalleryMutation.isPending}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  >
                    {createPhotoGalleryMutation.isPending ? "Creating..." : "Create Gallery"}
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