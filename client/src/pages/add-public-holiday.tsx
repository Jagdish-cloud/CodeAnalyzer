import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Clock, MapPin, FileText, ArrowLeft, Save } from 'lucide-react';
import { insertPublicHolidaySchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

const formSchema = insertPublicHolidaySchema.extend({
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddPublicHoliday() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: new Date().getFullYear().toString(),
      holidayDescription: '',
      holidayType: 'full_day',
      fromDate: '',
      toDate: '',
    },
  });

  const createHolidayMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest('POST', '/api/public-holidays', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Holiday Created",
        description: "Public holiday has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/public-holidays'] });
      navigate('/public-holidays');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create holiday. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    // Validate that toDate is not before fromDate
    if (new Date(data.toDate) < new Date(data.fromDate)) {
      toast({
        title: "Invalid Date Range",
        description: "End date cannot be before start date.",
        variant: "destructive",
      });
      return;
    }

    createHolidayMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/public-holidays')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Calendar
            </Button>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Add Public Holiday
            </h1>
            <p className="text-white/70">
              Create a new public holiday or vacation period
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Holiday Details</CardTitle>
            <CardDescription className="text-white/70">
              Fill in the information for the new public holiday or vacation period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Year */}
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Year</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 5 }, (_, i) => {
                                const year = (new Date().getFullYear() - 2 + i).toString();
                                return (
                                  <SelectItem key={year} value={year}>
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Holiday Type */}
                  <FormField
                    control={form.control}
                    name="holidayType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Holiday Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="full_day" id="full_day" />
                              <Label htmlFor="full_day" className="text-white">Full Day</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="half_day" id="half_day" />
                              <Label htmlFor="half_day" className="text-white">Half Day</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Holiday Description */}
                <FormField
                  control={form.control}
                  name="holidayDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Holiday Description
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Independence Day, Diwali, Summer Vacation"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </FormControl>
                      <FormDescription className="text-white/60">
                        Enter a clear description of the holiday or vacation period
                      </FormDescription>
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
                        <FormLabel className="text-white flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          From Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </FormControl>
                        <FormDescription className="text-white/60">
                          Start date of the holiday period
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          To Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </FormControl>
                        <FormDescription className="text-white/60">
                          End date of the holiday period
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={createHolidayMutation.isPending}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg px-8"
                  >
                    {createHolidayMutation.isPending ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Holiday
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Quick Examples */}
        <Card className="mt-6 bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Quick Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="font-semibold text-white mb-2">National Holiday</h3>
                <p className="text-white/70 text-sm">
                  Single day holidays like Independence Day, Republic Day
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="font-semibold text-white mb-2">Festival Period</h3>
                <p className="text-white/70 text-sm">
                  Multi-day celebrations like Diwali, Christmas holidays
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="font-semibold text-white mb-2">Vacation Period</h3>
                <p className="text-white/70 text-sm">
                  Extended breaks like Summer vacation, Winter break
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}