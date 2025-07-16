import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, FileText } from "lucide-react";

const formSchema = z.object({
  year: z.string().min(1, "Year is required"),
  topicName: z.string().min(1, "Topic name is required").max(500, "Topic name too long"),
  file: z.any().refine((files) => files?.length === 1, "File is required")
});

type FormValues = z.infer<typeof formSchema>;

export default function AddNewsletterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: new Date().getFullYear().toString(),
      topicName: "",
      file: undefined,
    },
  });

  const createNewsletterMutation = useMutation({
    mutationFn: async (data: { year: string; topicName: string; file: File }) => {
      const formData = new FormData();
      formData.append('year', data.year);
      formData.append('topicName', data.topicName);
      formData.append('file', data.file);

      const response = await fetch('/api/newsletters', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create newsletter');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Newsletter Created",
        description: "The newsletter has been successfully uploaded.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/newsletters'] });
      setLocation('/newsletter');
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
    if (selectedFile) {
      createNewsletterMutation.mutate({
        year: values.year,
        topicName: values.topicName,
        file: selectedFile,
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
      form.setValue('file', files);
      form.clearErrors('file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/newsletter">
              <Button variant="outline" size="sm" className="bg-white/70 backdrop-blur-sm border-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Newsletters
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Add Newsletter
            </h1>
          </div>
          <p className="text-gray-600">
            Upload a new newsletter document with topic information.
          </p>
        </div>

        {/* Form Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-white/20">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Newsletter Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Year Selection */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/50 border-white/20">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[2024, 2025, 2026, 2027, 2028].map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Topic Name */}
                <FormField
                  control={form.control}
                  name="topicName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Topic Name</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter newsletter topic or description..."
                          className="bg-white/50 border-white/20 min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Upload */}
                <FormField
                  control={form.control}
                  name="file"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Newsletter File</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <div className="space-y-2">
                              <h3 className="text-lg font-medium text-gray-700">Upload Newsletter</h3>
                              <p className="text-sm text-gray-500">
                                Drag and drop your file here, or click to browse
                              </p>
                              <p className="text-xs text-gray-400">
                                Supported formats: PDF, DOC, DOCX (Max 10MB)
                              </p>
                            </div>
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                              className="mt-4 cursor-pointer"
                            />
                          </div>

                          {/* Selected File Preview */}
                          {selectedFile && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-emerald-500" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-emerald-900">{selectedFile.name}</h4>
                                  <p className="text-sm text-emerald-600">
                                    Size: {formatFileSize(selectedFile.size)}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedFile(null);
                                    form.setValue('file', undefined);
                                    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                                    if (fileInput) fileInput.value = '';
                                  }}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-white/20">
                  <Link href="/newsletter">
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
                    disabled={createNewsletterMutation.isPending || !selectedFile}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                  >
                    {createNewsletterMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Create Newsletter
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