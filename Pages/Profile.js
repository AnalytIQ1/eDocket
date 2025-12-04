import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  User, Shield, MapPin, Phone, BadgeCheck, 
  Save, Loader2, Mail, Building, Calendar,
  Lock, Camera
} from "lucide-react";
import { toast } from "sonner";
import moment from 'moment';
import { ROLE_DESCRIPTIONS } from "@/components/auth/RolePermissions";

const SAPS_ROLES = [
  "Constable",
  "Detective", 
  "Station Commander",
  "Provincial Minister",
  "National Minister"
];

const PROVINCES = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", 
  "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape", "National"
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    saps_role: '',
    badge_number: '',
    province: '',
    station: '',
    phone: '',
    profile_picture: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        saps_role: userData.saps_role || 'Constable',
        badge_number: userData.badge_number || '',
        province: userData.province || '',
        station: userData.station || '',
        phone: userData.phone || '',
        profile_picture: userData.profile_picture || ''
      });
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe(data);
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      loadUser();
    },
    onError: () => {
      toast.error("Failed to update profile");
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_picture: file_url }));
      toast.success("Photo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            My Profile
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your account and SAPS details
          </p>
        </div>

        {/* Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Profile Summary */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                {formData.profile_picture ? (
                  <img 
                    src={formData.profile_picture} 
                    alt="Profile" 
                    className="h-24 w-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#003366] to-[#002244] flex items-center justify-center mx-auto">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-[#003366] flex items-center justify-center border-4 border-white cursor-pointer hover:bg-[#002244] transition-colors">
                  {uploadingPhoto ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 text-white" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              
              <h2 className="text-xl font-bold text-slate-900">
                {user?.full_name || 'SAPS Officer'}
              </h2>
              <p className="text-blue-600 font-medium mt-1">
                {formData.saps_role || 'SAPS Member'}
              </p>
              
              {formData.badge_number && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                  <Shield className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-mono font-medium text-slate-700">
                    {formData.badge_number}
                  </span>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{user?.email}</span>
                </div>
                {formData.province && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{formData.province}</span>
                  </div>
                )}
                {formData.station && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{formData.station}</span>
                  </div>
                )}
                {formData.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{formData.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Member since {moment(user?.created_date).format('MMMM YYYY')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Right - Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleChange('full_name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-slate-50"
                      />
                      <p className="text-xs text-slate-400">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder="+27 XX XXX XXXX"
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="badge_number">Badge/Service Number</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="badge_number"
                          value={formData.badge_number}
                          onChange={(e) => handleChange('badge_number', e.target.value)}
                          placeholder="e.g., SAPS-12345"
                          className="pl-9 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      SAPS Assignment Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="saps_role">Role / Rank</Label>
                        <Input
                          id="saps_role"
                          value={formData.saps_role || 'Not assigned'}
                          disabled
                          className="bg-slate-50 font-medium"
                        />
                        <p className="text-xs text-amber-600">
                          Role is assigned during registration and cannot be changed here. Contact your Station Commander for role changes.
                        </p>
                        {formData.saps_role && ROLE_DESCRIPTIONS[formData.saps_role] && (
                          <p className="text-xs text-slate-500 mt-1">
                            {ROLE_DESCRIPTIONS[formData.saps_role].description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="province">Province</Label>
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
                        <Label htmlFor="station">Police Station</Label>
                        <Input
                          id="station"
                          value={formData.station}
                          onChange={(e) => handleChange('station', e.target.value)}
                          placeholder="e.g., Sandton SAPS"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="bg-[#003366] hover:bg-[#002244]"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-600" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <BadgeCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Account Verified</p>
                        <p className="text-sm text-slate-500">Your account is verified and secure</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Last Login</p>
                        <p className="text-sm text-slate-500">
                          {moment().format('DD MMMM YYYY, HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-500 mb-3">
                      Need to change your password or update security settings?
                    </p>
                    <Button variant="outline" className="gap-2">
                      <Lock className="h-4 w-4" />
                      Manage Security Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}