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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Map Institution to Modules</h1>
          <p className="text-muted-foreground">Configure which modules are available for each institution</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save Configuration</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Institution Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Select Institution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search institutions..." className="pl-8" />
            </div>
            
            <div className="space-y-2">
              {institutions.map((institution) => (
                <div key={institution.id} className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <h4 className="font-medium">{institution.name}</h4>
                  <p className="text-sm text-muted-foreground">{institution.location}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module Selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Available Modules</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select>
                <SelectTrigger className="w-48">
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
                <div key={module.id} className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                  <Checkbox id={`module-${module.id}`} />
                  <div className="flex-1">
                    <Label htmlFor={`module-${module.id}`} className="font-medium cursor-pointer">
                      {module.name}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Map className="h-5 w-5" />
            <span>Current Mappings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2">Institution</th>
                  <th className="text-left p-2">Mapped Modules</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Last Updated</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-2">
                    <div>
                      <div className="font-medium">Springfield Elementary</div>
                      <div className="text-sm text-muted-foreground">Springfield, IL</div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Student Management</span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Grade Management</span>
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">+2 more</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
                  </td>
                  <td className="p-2 text-sm text-muted-foreground">2 days ago</td>
                  <td className="p-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-2">
                    <div>
                      <div className="font-medium">Riverside High School</div>
                      <div className="text-sm text-muted-foreground">Riverside, CA</div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">All Modules</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
                  </td>
                  <td className="p-2 text-sm text-muted-foreground">1 week ago</td>
                  <td className="p-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}