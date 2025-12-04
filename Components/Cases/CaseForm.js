import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Save, Loader2, Upload, X, Image, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const CRIME_TYPES = [
  "Murder", "Sexual Offences", "Attempted Murder", "Assault GBH", "Common Assault",
  "Common Robbery", "Robbery with Aggravating Circumstances", "Burglary Residential",
  "Burglary Non-Residential", "Theft of Motor Vehicle", "Theft from Motor Vehicle",
  "Stock Theft", "Illegal Possession of Firearms", "Drug-Related Crime", 
  "Driving Under Influence", "Fraud", "Malicious Damage to Property", "Carjacking", 
  "Truck Hijacking", "Cash-in-Transit Robbery", "Bank Robbery", "Other"
];

const PROVINCES = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State",
  "Limpopo", "Mpumalanga", "North West", "Northern Cape"
];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export default function CaseForm({ initialData = {}, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    crime_type: initialData.crime_type || '',
    province: initialData.province || '',
    district: initialData.district || '',
    location_address: initialData.location_address || '',
    incident_date: initialData.incident_date ? new Date(initialData.incident_date) : new Date(),
    priority: initialData.priority || 'Medium',
    description: initialData.description || '',
    victim_info: initialData.victim_info || '',
    suspect_info: initialData.suspect_info || '',
    evidence_files: initialData.evidence_files || [],
  });
  
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    const uploadedUrls = [...formData.evidence_files];

    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(file_url);
    }

    setFormData(prev => ({ ...prev, evidence_files: uploadedUrls }));
    setUploadingFiles(false);
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      evidence_files: prev.evidence_files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      incident_date: formData.incident_date.toISOString(),
    });
  };

  const isImageFile = (url) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl text-[#003366]">Case Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Crime Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="crime_type">Crime Type *</Label>
              <Select
                value={formData.crime_type}
                onValueChange={(value) => handleChange('crime_type', value)}
              >
                <SelectTrigger id="crime_type">
                  <SelectValue placeholder="Select crime type" />
                </SelectTrigger>
                <SelectContent>
                  {CRIME_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange('priority', value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="province">Province *</Label>
              <Select
                value={formData.province}
                onValueChange={(value) => handleChange('province', value)}
              >
                <SelectTrigger id="province">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map(province => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Police Station/District</Label>
              <Input
                id="district"
                placeholder="e.g., Sandton SAPS"
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_address">Location Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="location_address"
                  placeholder="Street address"
                  value={formData.location_address}
                  onChange={(e) => handleChange('location_address', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Incident Date & Time *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full md:w-[280px] justify-start text-left font-normal",
                    !formData.incident_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.incident_date ? (
                    format(formData.incident_date, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.incident_date}
                  onSelect={(date) => handleChange('incident_date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Incident Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of the incident..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
            />
          </div>

          {/* Parties Involved */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="victim_info">Victim Information</Label>
              <Textarea
                id="victim_info"
                placeholder="Age, gender, any relevant details (anonymized)"
                value={formData.victim_info}
                onChange={(e) => handleChange('victim_info', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suspect_info">Suspect Description</Label>
              <Textarea
                id="suspect_info"
                placeholder="Physical description, clothing, vehicle, etc."
                value={formData.suspect_info}
                onChange={(e) => handleChange('suspect_info', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Evidence Upload Section */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold text-[#003366]">Evidence Files</Label>
                <p className="text-sm text-slate-500 mt-1">Upload photos, documents, or other evidence</p>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingFiles}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="gap-2 border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white"
                  disabled={uploadingFiles}
                  onClick={(e) => e.currentTarget.previousSibling.click()}
                >
                  {uploadingFiles ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Evidence
                    </>
                  )}
                </Button>
              </label>
            </div>

            {/* Uploaded Files Preview */}
            {formData.evidence_files.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.evidence_files.map((fileUrl, index) => (
                  <div key={index} className="relative group">
                    {isImageFile(fileUrl) ? (
                      <div className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                        <img 
                          src={fileUrl} 
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center justify-center">
                        <FileText className="h-8 w-8 text-[#003366] mb-2" />
                        <span className="text-xs text-slate-500">Document</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {formData.evidence_files.length === 0 && (
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                <Image className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No evidence files uploaded yet</p>
                <p className="text-xs text-slate-400 mt-1">Supported: Images, PDF, Word documents</p>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !formData.crime_type || !formData.province || !formData.description}
              className="bg-[#003366] hover:bg-[#002244]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Case
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}