import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSubjectSchema, type InsertSubject } from "@shared/schema";
import { Link } from "wouter";

const formSchema = insertSubjectSchema.extend({
  subjectName: z.string().min(1, "Subject name is required").trim(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddSubject() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectName: "",
      status: "active",
    },
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const subjectData: InsertSubject = {
        subjectName: data.subjectName,
        status: data.status || "active",
      };

      return apiRequest("POST", "/api/subjects", subjectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      toast({
        title: "Success",
        description: "Subject added successfully",
      });
      setLocation("/subjects");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add subject",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createSubjectMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950 dark:via-pink-950 dark:to-rose-950">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-8 flex flex-col items-center">
          {/* Header Section */}
          <div className="flex items-center gap-4">
            <Link href="/subjects">
              <Button variant="outline" size="sm" className="hover:bg-slate-50 dark:hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Subjects
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
                Add Subject
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                Add a new subject to the system
              </p>
            </div>
          </div>

          <Card className="max-w-5xl w-full border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Subject Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Subject Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
                      Subject Details
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="subjectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter subject name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={createSubjectMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {createSubjectMutation.isPending ? "Saving..." : "Save Subject"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}