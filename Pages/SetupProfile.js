import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
import { Shield, User, MapPin, Phone, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
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

export default function SetupProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    saps_role: '',
    badge_number: '',
    province: '',
    station: '',
    phone: ''
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // If user already has a role, redirect to dashboard
      if (userData.saps_role) {
        navigate(createPageUrl("Dashboard"));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        full_name: userData.full_name || ''
      }));
    } catch (error) {
      // Not logged in
      base44.auth.redirectToLogin();
    } finally {
      setLoading(false);
    }
  };

  const setupMutation = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe(formData);
    },
    onSuccess: () => {
      toast.success("Profile setup complete!");
      navigate(createPageUrl("Dashboard"));
    },
    onError: () => {
      toast.error("Failed to complete setup");
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.saps_role) {
      toast.error("Please select your role");
      return;
    }
    setupMutation.mutate();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#003366] to-[#002244]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] to-[#002244] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-xl bg-[#FFD700] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-[#003366]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
          <p className="text-white/70 mt-2">Set up your SAPS account to get started</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-[#003366]">
              <User className="h-5 w-5" />
              SAPS Officer Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="saps_role">Role / Rank *</Label>
                <Select
                  value={formData.saps_role}
                  onValueChange={(value) => handleChange('saps_role', value)}
                  required
                >
                  <SelectTrigger id="saps_role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAPS_ROLES.map(role => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-[#003366]" />
                          {role}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.saps_role && ROLE_DESCRIPTIONS[formData.saps_role] && (
                  <div className="p-3 bg-slate-50 rounded-lg mt-2">
                    <p className="text-xs text-slate-600">
                      <span className="font-medium text-[#003366]">{formData.saps_role}:</span>{' '}
                      {ROLE_DESCRIPTIONS[formData.saps_role].description}
                    </p>
                  </div>
                )}
                <p className="text-xs text-amber-600">
                  ⚠️ Please select your correct role. This cannot be changed later without admin approval.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="station">Police Station</Label>
                  <Input
                    id="station"
                    value={formData.station}
                    onChange={(e) => handleChange('station', e.target.value)}
                    placeholder="e.g., Sandton SAPS"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="badge_number">Badge/Service Number</Label>
                  <Input
                    id="badge_number"
                    value={formData.badge_number}
                    onChange={(e) => handleChange('badge_number', e.target.value)}
                    placeholder="e.g., SAPS-12345"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+27 XX XXX XXXX"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={!formData.saps_role || !formData.full_name || setupMutation.isPending}
                className="w-full bg-[#003366] hover:bg-[#002244] h-12 text-base"
              >
                {setupMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Complete Setup
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-white/50 text-sm mt-6">
          South African Police Service - Crime Analytics Platform
        </p>
      </div>
    </div>
  );
}