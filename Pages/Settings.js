import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Settings as SettingsIcon, Bell, Shield, Moon, Globe, 
  Save, Loader2, Lock, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    case_updates: true,
    weekly_reports: true,
    dark_mode: false,
    two_factor_auth: false,
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.settings) {
        setSettings(prev => ({ ...prev, ...u.settings }));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({ settings });
    },
    onSuccess: () => {
      toast.success("Settings saved successfully");
    },
    onError: () => {
      toast.error("Failed to save settings");
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#003366]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#003366]">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your account preferences</p>
        </div>

        <div className="space-y-6">
          {/* Notification Settings */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-[#003366]" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-slate-500">Receive updates via email</p>
                </div>
                <Switch 
                  checked={settings.email_notifications}
                  onCheckedChange={(v) => setSettings(s => ({ ...s, email_notifications: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-slate-500">Receive urgent alerts via SMS</p>
                </div>
                <Switch 
                  checked={settings.sms_notifications}
                  onCheckedChange={(v) => setSettings(s => ({ ...s, sms_notifications: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Case Update Alerts</Label>
                  <p className="text-sm text-slate-500">Get notified when cases are updated</p>
                </div>
                <Switch 
                  checked={settings.case_updates}
                  onCheckedChange={(v) => setSettings(s => ({ ...s, case_updates: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-slate-500">Receive weekly crime statistics summary</p>
                </div>
                <Switch 
                  checked={settings.weekly_reports}
                  onCheckedChange={(v) => setSettings(s => ({ ...s, weekly_reports: v }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-[#003366]" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-slate-500">Add extra security to your account</p>
                </div>
                <Switch 
                  checked={settings.two_factor_auth}
                  onCheckedChange={(v) => setSettings(s => ({ ...s, two_factor_auth: v }))}
                />
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Lock className="h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-[#003366] hover:bg-[#002244] gap-2"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}