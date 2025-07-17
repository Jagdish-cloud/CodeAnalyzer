import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Plus, FileText, Upload, Bell, Type, MessageSquare, File } from "lucide-react";
import { insertNewsCircularSchema } from "@shared/schema";

const formSchema = insertNewsCircularSchema;
type FormValues = z.infer<typeof formSchema>;

export default function AddNewsCircularPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventType: "",
      title: "",
      description: "",
      text: "",
      fromDate: "",
      toDate: "",
      fileName: "",
      filePath: "",
      fileSize: undefined,
    },
  });

  const selectedEventType = form.watch('eventType');

  const createNewsCircularMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });
      
      // Add file if selected
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch('/api/news-circulars', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create news/circular');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "News/Circular Created",
        description: "The news/circular has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/news-circulars'] });
      setLocation('/news-circulars');
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
    createNewsCircularMutation.mutate(values);
  };

  const validateDateRange = (fromDate: string, toDate: string) => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (from > to) {
        form.setError('toDate', {
          type: 'manual',
          message: 'To date must be after from date',
        });
        return false;
      }
    }
    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const renderEventSpecificFields = () => {
    switch (selectedEventType) {
      case 'Flash News':
        return (
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Flash News Text
                  </div>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter brief flash news text..."
                    className="bg-white/50 border-white/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'School News':
        return (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      News Title
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter news title..."
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Description
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter detailed description with rich formatting...
Examples:
• **Important:** All students must attend
• *Schedule:* 10:00 AM - 2:00 PM
• Contact: Ms. Smith (ext. 234)"
                      className="bg-white/50 border-white/20 min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 'Notice & Circular':
        return (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Notice Title
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter notice title..."
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Description
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter detailed description with rich formatting...
Examples:
• **Important:** All students must attend
• *Schedule:* 10:00 AM - 2:00 PM
• Contact: Ms. Smith (ext. 234)"
                      className="bg-white/50 border-white/20 min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  File Upload (Optional)
                </div>
              </label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="bg-white/50 border-white/20"
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <File className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 5MB)
              </p>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/news-circulars">
              <Button variant="outline" size="sm" className="bg-white/70 backdrop-blur-sm border-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to News & Circulars
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Add News / Circular
            </h1>
          </div>
          <p className="text-gray-600">
            Create a new flash news, school news, or circular announcement.
          </p>
        </div>

        {/* Form Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-white/20">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                News/Circular Details
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Event Type Selection */}
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Type of Event
                        </div>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/50 border-white/20">
                            <SelectValue placeholder="Select event type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Flash News">Flash News</SelectItem>
                          <SelectItem value="School News">School News</SelectItem>
                          <SelectItem value="Notice & Circular">Notice & Circular</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fromDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">From Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input
                              type="date"
                              className="bg-white/50 border-white/20 pl-10"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const toDate = form.getValues('toDate');
                                if (toDate) {
                                  validateDateRange(e.target.value, toDate);
                                }
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">To Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input
                              type="date"
                              className="bg-white/50 border-white/20 pl-10"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                const fromDate = form.getValues('fromDate');
                                if (fromDate) {
                                  validateDateRange(fromDate, e.target.value);
                                }
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Dynamic Fields Based on Event Type */}
                {selectedEventType && (
                  <div className="space-y-6">
                    <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-2">
                        {selectedEventType} Configuration
                      </h3>
                      <p className="text-sm text-blue-600">
                        {selectedEventType === 'Flash News' && "Enter a brief, impactful news snippet for immediate display."}
                        {selectedEventType === 'School News' && "Create detailed school news with rich formatting capabilities."}
                        {selectedEventType === 'Notice & Circular' && "Create formal notices with document attachments."}
                      </p>
                    </div>
                    
                    {renderEventSpecificFields()}
                  </div>
                )}

                {/* Date Range Info */}
                {form.watch('fromDate') && form.watch('toDate') && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      <div>
                        <h4 className="font-medium text-purple-900">Display Duration</h4>
                        <p className="text-sm text-purple-600">
                          {(() => {
                            const from = new Date(form.watch('fromDate'));
                            const to = new Date(form.watch('toDate'));
                            const diffTime = Math.abs(to.getTime() - from.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            
                            if (diffDays === 1) {
                              return 'Will be displayed for 1 day';
                            } else if (diffDays === 0) {
                              return 'Will be displayed for same day';
                            } else {
                              return `Will be displayed for ${diffDays} days`;
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-white/20">
                  <Link href="/news-circulars">
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
                    disabled={createNewsCircularMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {createNewsCircularMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create {selectedEventType || 'News/Circular'}
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