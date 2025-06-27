import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Map, 
  Building, 
  BookOpen, 
  Save,
  Search,
  Filter
} from "lucide-react";

export default function Mapping() {
  const institutions = [
    { id: 1, name: "Springfield Elementary", location: "Springfield, IL" },
    { id: 2, name: "Riverside High School", location: "Riverside, CA" },
    { id: 3, name: "Mountain View Academy", location: "Denver, CO" },
    { id: 4, name: "Coastal Community College", location: "Miami, FL" }
  ];

  const modules = [
    { id: 1, name: "Student Management", category: "Administration", description: "Manage student records and enrollment" },
    { id: 2, name: "Grade Management", category: "Academic", description: "Handle grades and assessments" },
    { id: 3, name: "Library Management", category: "Resources", description: "Manage library resources and lending" },
    { id: 4, name: "Fee Management", category: "Finance", description: "Handle fee collection and payments" },
    { id: 5, name: "Attendance Tracking", category: "Academic", description: "Track student and staff attendance" },
    { id: 6, name: "Communication Hub", category: "Communication", description: "Parent-teacher communication portal" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-950 dark:via-blue-950 dark:to-cyan-950">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Institution Module Mapping
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Configure which modules are available for each institution
            </p>
          </div>
          <Button className="btn-modern bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Institution Selection */}
          <Card className="glass-morphism card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-slate-200">
                <Building className="h-5 w-5 text-blue-600" />
                <span>Select Institution</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search institutions..." 
                  className="pl-8 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" 
                />
              </div>
              
              <div className="space-y-2">
                {institutions.map((institution) => (
                  <div key={institution.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white/70 dark:hover:bg-slate-800/70 cursor-pointer transition-all duration-200">
                    <h4 className="font-medium text-slate-800 dark:text-slate-200">{institution.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{institution.location}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Module Selection */}
          <Card className="lg:col-span-2 glass-morphism card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-slate-200">
                <BookOpen className="h-5 w-5 text-green-600" />
                <span>Available Modules</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Select>
                  <SelectTrigger className="w-48 bg-white/50 dark:bg-slate-800/50">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="administration">Administration</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="resources">Resources</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((module) => (
                  <div key={module.id} className="flex items-start space-x-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
                    <Checkbox id={`module-${module.id}`} />
                    <div className="flex-1">
                      <Label htmlFor={`module-${module.id}`} className="font-medium cursor-pointer text-slate-800 dark:text-slate-200">
                        {module.name}
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{module.description}</p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                        {module.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Mappings */}
        <Card className="glass-morphism card-hover">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-slate-200">
              <Map className="h-5 w-5 text-purple-600" />
              <span>Current Mappings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-3 text-slate-700 dark:text-slate-300 font-medium">Institution</th>
                    <th className="text-left p-3 text-slate-700 dark:text-slate-300 font-medium">Mapped Modules</th>
                    <th className="text-left p-3 text-slate-700 dark:text-slate-300 font-medium">Status</th>
                    <th className="text-left p-3 text-slate-700 dark:text-slate-300 font-medium">Last Updated</th>
                    <th className="text-left p-3 text-slate-700 dark:text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-white/50 dark:hover:bg-slate-800/50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">Springfield Elementary</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Springfield, IL</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">Student Management</span>
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">Grade Management</span>
                        <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">+2 more</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">Active</span>
                    </td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-400">2 days ago</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">Edit</Button>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-white/50 dark:hover:bg-slate-800/50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">Riverside High School</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Riverside, CA</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">All Modules</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">Active</span>
                    </td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-400">1 week ago</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">Edit</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}