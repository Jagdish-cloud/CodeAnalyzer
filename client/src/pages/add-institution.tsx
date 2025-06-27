import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Building, 
  Users, 
  MapPin, 
  Plus, 
  Trash2, 
  User,
  Shield, 
  Smartphone,
  ChevronRight,
  Info,
  Check
} from "lucide-react";
import type { InsertInstitution, ContactPerson, Branch, SuperAdmin, MobileApp } from "@shared/schema";

export default function AddInstitution() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<InsertInstitution>({
    inst_name: "",
    inst_location: "",
    inst_address: "",
    inst_logo: undefined,
    inst_Official_Website: "",
    inst_Official_Contact_Number: "",
    inst_Official_Email_Id: "",
    inst_branches: [
      {
        branch_name: "",
        branch_address: "",
        branch_contact_person_name: "",
        branch_contact_person_designation: "",
        branch_contact_person_mobile_number: "",
        branch_contact_person_email: "",
        branch_super_admins: [
          {
            branch_super_admin_name: "",
            branch_super_admin_mobile_number: "",
            branch_super_admin_email: ""
          }
        ],
        branch_mobile_app: [
          {
            branch_mobile_license_count: "",
            branch_bhagen_logo_flag: "yes" as const
          }
        ]
      }
    ],
    inst_contact_person: [
      {
        contact_person_name: "",
        contact_person_designation: "",
        contact_person_mobile_number: "",
        contact_person_email: ""
      }
    ]
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const createInstitutionMutation = useMutation({
    mutationFn: async (data: { formData: InsertInstitution; file?: File }) => {
      const formDataToSend = new FormData();
      formDataToSend.append('institutionData', JSON.stringify(data.formData));
      
      if (data.file) {
        formDataToSend.append('inst_logo', data.file);
      }

      const response = await fetch('/api/institutions', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create institution');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/institutions'] });
      toast({
        title: "Success",
        description: "Institution created successfully",
      });
      setLocation('/');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInstitutionChange = (field: keyof InsertInstitution, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (index: number, field: keyof ContactPerson, value: string) => {
    const updatedContacts = [...formData.inst_contact_person];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setFormData(prev => ({ ...prev, inst_contact_person: updatedContacts }));
  };

  const handleBranchChange = (branchIndex: number, field: keyof Branch, value: string) => {
    const updatedBranches = [...formData.inst_branches];
    updatedBranches[branchIndex] = { ...updatedBranches[branchIndex], [field]: value };
    setFormData(prev => ({ ...prev, inst_branches: updatedBranches }));
  };

  const handleSuperAdminChange = (branchIndex: number, adminIndex: number, field: keyof SuperAdmin, value: string) => {
    const updatedBranches = [...formData.inst_branches];
    updatedBranches[branchIndex].branch_super_admins[adminIndex] = {
      ...updatedBranches[branchIndex].branch_super_admins[adminIndex],
      [field]: value
    };
    setFormData(prev => ({ ...prev, inst_branches: updatedBranches }));
  };

  const handleMobileAppChange = (branchIndex: number, field: keyof MobileApp, value: string) => {
    const updatedBranches = [...formData.inst_branches];
    updatedBranches[branchIndex].branch_mobile_app[0] = {
      ...updatedBranches[branchIndex].branch_mobile_app[0],
      [field]: value
    };
    setFormData(prev => ({ ...prev, inst_branches: updatedBranches }));
  };

  const addContactPerson = () => {
    setFormData(prev => ({
      ...prev,
      inst_contact_person: [
        ...prev.inst_contact_person,
        {
          contact_person_name: "",
          contact_person_designation: "",
          contact_person_mobile_number: "",
          contact_person_email: ""
        }
      ]
    }));
  };

  const removeContactPerson = (index: number) => {
    if (formData.inst_contact_person.length > 1) {
      const updatedContacts = formData.inst_contact_person.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, inst_contact_person: updatedContacts }));
    }
  };

  const addBranch = () => {
    setFormData(prev => ({
      ...prev,
      inst_branches: [
        ...prev.inst_branches,
        {
          branch_name: "",
          branch_address: "",
          branch_contact_person_name: "",
          branch_contact_person_designation: "",
          branch_contact_person_mobile_number: "",
          branch_contact_person_email: "",
          branch_super_admins: [
            {
              branch_super_admin_name: "",
              branch_super_admin_mobile_number: "",
              branch_super_admin_email: ""
            }
          ],
          branch_mobile_app: [
            {
              branch_mobile_license_count: "",
              branch_bhagen_logo_flag: "yes" as const
            }
          ]
        }
      ]
    }));
  };

  const removeBranch = (index: number) => {
    if (formData.inst_branches.length > 1) {
      const updatedBranches = formData.inst_branches.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, inst_branches: updatedBranches }));
    }
  };

  const addSuperAdmin = (branchIndex: number) => {
    const updatedBranches = [...formData.inst_branches];
    updatedBranches[branchIndex].branch_super_admins.push({
      branch_super_admin_name: "",
      branch_super_admin_mobile_number: "",
      branch_super_admin_email: ""
    });
    setFormData(prev => ({ ...prev, inst_branches: updatedBranches }));
  };

  const removeSuperAdmin = (branchIndex: number, adminIndex: number) => {
    const updatedBranches = [...formData.inst_branches];
    if (updatedBranches[branchIndex].branch_super_admins.length > 1) {
      updatedBranches[branchIndex].branch_super_admins = 
        updatedBranches[branchIndex].branch_super_admins.filter((_, i) => i !== adminIndex);
      setFormData(prev => ({ ...prev, inst_branches: updatedBranches }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInstitutionMutation.mutate({ formData, file: selectedFile || undefined });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950 dark:via-amber-950 dark:to-orange-950">
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
            <span>Dashboard</span>
            <ChevronRight className="h-3 w-3" />
            <span>Institutions</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-blue-600 dark:text-blue-400">Add New Institution</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">
            Add New Institution
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Enter comprehensive details for the new educational institution including branches, contacts, and administrative configuration.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Institution Details */}
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Building className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Institution Details</CardTitle>
                  <p className="text-sm text-muted-foreground">Basic information about the institution</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Label htmlFor="inst_name">
                    Institution Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="inst_name"
                    value={formData.inst_name}
                    onChange={(e) => handleInstitutionChange("inst_name", e.target.value)}
                    placeholder="Enter institution name"
                    required
                  />
                </div>
                
                <div className="lg:col-span-1">
                  <Label htmlFor="inst_location">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="inst_location"
                    value={formData.inst_location}
                    onChange={(e) => handleInstitutionChange("inst_location", e.target.value)}
                    placeholder="City, State"
                    required
                  />
                </div>
                
                <div className="lg:col-span-1">
                  <Label htmlFor="inst_contact">
                    Official Contact Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="inst_contact"
                    type="tel"
                    value={formData.inst_Official_Contact_Number}
                    onChange={(e) => handleInstitutionChange("inst_Official_Contact_Number", e.target.value)}
                    placeholder="Enter contact number"
                    required
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <Label htmlFor="inst_address">
                    Address <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="inst_address"
                    rows={3}
                    value={formData.inst_address}
                    onChange={(e) => handleInstitutionChange("inst_address", e.target.value)}
                    placeholder="Enter full address"
                    className="resize-none"
                    required
                  />
                </div>
                
                <div className="lg:col-span-1">
                  <Label htmlFor="inst_email">
                    Official Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="inst_email"
                    type="email"
                    value={formData.inst_Official_Email_Id}
                    onChange={(e) => handleInstitutionChange("inst_Official_Email_Id", e.target.value)}
                    placeholder="Enter official email"
                    required
                  />
                </div>
                
                <div className="lg:col-span-1">
                  <Label htmlFor="inst_website">Official Website</Label>
                  <Input
                    id="inst_website"
                    type="url"
                    value={formData.inst_Official_Website}
                    onChange={(e) => handleInstitutionChange("inst_Official_Website", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="lg:col-span-1">
                  <FileUpload
                    onFileSelect={setSelectedFile}
                    accept="image/*"
                    label="Institution Logo"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Persons */}
          <Card>
            <CardHeader className="bg-green-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Contact Persons</CardTitle>
                    <p className="text-sm text-muted-foreground">Primary contacts for the institution</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addContactPerson}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {formData.inst_contact_person.map((contact, index) => (
                <div key={index} className="border border-border rounded-lg p-4 mb-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium">Contact Person #{index + 1}</h4>
                    {formData.inst_contact_person.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContactPerson(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`contact_name_${index}`}>
                        Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`contact_name_${index}`}
                        value={contact.contact_person_name}
                        onChange={(e) => handleContactChange(index, "contact_person_name", e.target.value)}
                        placeholder="Contact person name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`contact_designation_${index}`}>
                        Designation <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`contact_designation_${index}`}
                        value={contact.contact_person_designation}
                        onChange={(e) => handleContactChange(index, "contact_person_designation", e.target.value)}
                        placeholder="Designation"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`contact_mobile_${index}`}>
                        Mobile Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`contact_mobile_${index}`}
                        type="tel"
                        value={contact.contact_person_mobile_number}
                        onChange={(e) => handleContactChange(index, "contact_person_mobile_number", e.target.value)}
                        placeholder="Mobile number"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`contact_email_${index}`}>
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`contact_email_${index}`}
                        type="email"
                        value={contact.contact_person_email}
                        onChange={(e) => handleContactChange(index, "contact_person_email", e.target.value)}
                        placeholder="Email address"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Branches */}
          <Card>
            <CardHeader className="bg-blue-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Branches</CardTitle>
                    <p className="text-sm text-muted-foreground">Institution branches and their configurations</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addBranch}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Branch
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {formData.inst_branches.map((branch, branchIndex) => (
                <div key={branchIndex} className="border-2 border-border rounded-xl p-6 mb-6 bg-muted/50">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold flex items-center space-x-2">
                      <Building className="h-5 w-5 text-blue-500" />
                      <span>Branch #{branchIndex + 1}</span>
                    </h4>
                    {formData.inst_branches.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeBranch(branchIndex)}
                        className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove Branch
                      </Button>
                    )}
                  </div>

                  {/* Branch Basic Info */}
                  <div className="bg-background rounded-lg p-4 mb-4 border">
                    <h5 className="text-md font-medium mb-4 flex items-center space-x-2">
                      <Info className="h-4 w-4 text-blue-500" />
                      <span>Branch Information</span>
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`branch_name_${branchIndex}`}>
                          Branch Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`branch_name_${branchIndex}`}
                          value={branch.branch_name}
                          onChange={(e) => handleBranchChange(branchIndex, "branch_name", e.target.value)}
                          placeholder="Branch name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`branch_address_${branchIndex}`}>
                          Branch Address <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id={`branch_address_${branchIndex}`}
                          rows={2}
                          value={branch.branch_address}
                          onChange={(e) => handleBranchChange(branchIndex, "branch_address", e.target.value)}
                          placeholder="Branch address"
                          className="resize-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Branch Contact Person */}
                  <div className="bg-background rounded-lg p-4 mb-4 border">
                    <h5 className="text-md font-medium mb-4 flex items-center space-x-2">
                      <User className="h-4 w-4 text-green-500" />
                      <span>Branch Contact Person</span>
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`branch_contact_name_${branchIndex}`}>
                          Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`branch_contact_name_${branchIndex}`}
                          value={branch.branch_contact_person_name}
                          onChange={(e) => handleBranchChange(branchIndex, "branch_contact_person_name", e.target.value)}
                          placeholder="Contact name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`branch_contact_designation_${branchIndex}`}>
                          Designation <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`branch_contact_designation_${branchIndex}`}
                          value={branch.branch_contact_person_designation}
                          onChange={(e) => handleBranchChange(branchIndex, "branch_contact_person_designation", e.target.value)}
                          placeholder="Designation"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`branch_contact_mobile_${branchIndex}`}>
                          Mobile Number <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`branch_contact_mobile_${branchIndex}`}
                          type="tel"
                          value={branch.branch_contact_person_mobile_number}
                          onChange={(e) => handleBranchChange(branchIndex, "branch_contact_person_mobile_number", e.target.value)}
                          placeholder="Mobile number"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`branch_contact_email_${branchIndex}`}>
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`branch_contact_email_${branchIndex}`}
                          type="email"
                          value={branch.branch_contact_person_email}
                          onChange={(e) => handleBranchChange(branchIndex, "branch_contact_person_email", e.target.value)}
                          placeholder="Email address"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Super Admins */}
                  <div className="bg-background rounded-lg p-4 mb-4 border">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-md font-medium flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-purple-500" />
                        <span>Super Administrators</span>
                      </h5>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addSuperAdmin(branchIndex)}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Admin
                      </Button>
                    </div>

                    {branch.branch_super_admins.map((admin, adminIndex) => (
                      <div key={adminIndex} className="border border-border rounded-lg p-3 mb-3 bg-muted/30">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">Super Admin #{adminIndex + 1}</span>
                          {branch.branch_super_admins.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSuperAdmin(branchIndex, adminIndex)}
                              className="text-destructive hover:text-destructive h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor={`admin_name_${branchIndex}_${adminIndex}`} className="text-xs">
                              Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id={`admin_name_${branchIndex}_${adminIndex}`}
                              value={admin.branch_super_admin_name}
                              onChange={(e) => handleSuperAdminChange(branchIndex, adminIndex, "branch_super_admin_name", e.target.value)}
                              placeholder="Admin name"
                              className="text-sm"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`admin_mobile_${branchIndex}_${adminIndex}`} className="text-xs">
                              Mobile Number <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id={`admin_mobile_${branchIndex}_${adminIndex}`}
                              type="tel"
                              value={admin.branch_super_admin_mobile_number}
                              onChange={(e) => handleSuperAdminChange(branchIndex, adminIndex, "branch_super_admin_mobile_number", e.target.value)}
                              placeholder="Mobile number"
                              className="text-sm"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`admin_email_${branchIndex}_${adminIndex}`} className="text-xs">
                              Email <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id={`admin_email_${branchIndex}_${adminIndex}`}
                              type="email"
                              value={admin.branch_super_admin_email}
                              onChange={(e) => handleSuperAdminChange(branchIndex, adminIndex, "branch_super_admin_email", e.target.value)}
                              placeholder="Email address"
                              className="text-sm"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile App Configuration */}
                  <div className="bg-background rounded-lg p-4 border">
                    <h5 className="text-md font-medium mb-4 flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-orange-500" />
                      <span>Mobile App Configuration</span>
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`license_count_${branchIndex}`}>
                          License Count <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`license_count_${branchIndex}`}
                          type="number"
                          value={branch.branch_mobile_app[0].branch_mobile_license_count}
                          onChange={(e) => handleMobileAppChange(branchIndex, "branch_mobile_license_count", e.target.value)}
                          placeholder="Number of licenses"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`logo_flag_${branchIndex}`}>Bhagen Logo Display</Label>
                        <Select
                          value={branch.branch_mobile_app[0].branch_bhagen_logo_flag}
                          onValueChange={(value) => handleMobileAppChange(branchIndex, "branch_bhagen_logo_flag", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4 text-primary" />
                  <span>All fields marked with <span className="text-destructive">*</span> are required</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={createInstitutionMutation.isPending}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="submit"
                    disabled={createInstitutionMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {createInstitutionMutation.isPending ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Submit Institution
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
