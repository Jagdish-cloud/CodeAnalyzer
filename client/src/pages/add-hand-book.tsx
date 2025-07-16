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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, FileText } from "lucide-react";

const formSchema = z.object({
  year: z.string().min(1, "Year is required"),
  file: z.any().refine((files) => files?.length === 1, "File is required")
});

type FormValues = z.infer<typeof formSchema>;

export default function AddHandBookPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: new Date().getFullYear().toString(),
      file: undefined,
    },
  });

  const createHandBookMutation = useMutation({
    mutationFn: async (data: { year: string; file: File }) => {
      const formData = new FormData();
      formData.append('year', data.year);
      formData.append('file', data.file);

      const response = await fetch('/api/handbooks', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload hand book');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Hand Book Uploaded",
        description: "The hand book has been successfully uploaded.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/handbooks'] });
      setLocation('/hand-book');
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    if (selectedFile) {
      createHandBookMutation.mutate({
        year: values.year,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/hand-book">
              <Button variant="outline" size="sm" className="bg-white/70 backdrop-blur-sm border-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Hand Books
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Upload Hand Book
            </h1>
          </div>
          <p className="text-gray-600">
            Upload a new hand book document for the selected academic year.
          </p>
        </div>

        {/* Form Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-white/20">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hand Book Details
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
                      <FormLabel className="text-sm font-medium text-gray-700">Academic Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/50 border-white/20">
                            <SelectValue placeholder="Select academic year" />
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

                {/* File Upload */}
                <FormField
                  control={form.control}
                  name="file"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Hand Book File</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <div className="space-y-2">
                              <h3 className="text-lg font-medium text-gray-700">Upload Hand Book</h3>
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
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-blue-500" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-blue-900">{selectedFile.name}</h4>
                                  <p className="text-sm text-blue-600">
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
                  <Link href="/hand-book">
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
                    disabled={createHandBookMutation.isPending || !selectedFile}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {createHandBookMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Hand Book
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