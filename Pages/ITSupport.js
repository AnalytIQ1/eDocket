import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { 
  Headphones, Send, Loader2, Phone, Mail, 
  MessageSquare, Clock, CheckCircle2, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function ITSupport() {
  const [formData, setFormData] = useState({
    issue_type: '',
    subject: '',
    description: '',
    priority: 'medium',
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      // Send email to IT support
      await base44.integrations.Core.SendEmail({
        to: user.email, // In production, this would be IT support email
        subject: `[IT Support] ${formData.issue_type}: ${formData.subject}`,
        body: `
Support Request from: ${user.full_name} (${user.email})
Role: ${user.saps_role || 'N/A'}
Province: ${user.province || 'N/A'}
Station: ${user.police_station || 'N/A'}

Issue Type: ${formData.issue_type}
Priority: ${formData.priority}
Subject: ${formData.subject}

Description:
${formData.description}
        `
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Support request submitted successfully");
    },
    onError: () => {
      toast.error("Failed to submit request. Please try again.");
    }
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Request Submitted!</h2>
            <p className="text-slate-500 mb-6">
              Your IT support request has been submitted. Our team will respond within 24-48 hours.
            </p>
            <Button 
              onClick={() => {
                setSubmitted(false);
                setFormData({ issue_type: '', subject: '', description: '', priority: 'medium' });
              }}
              className="bg-[#003366] hover:bg-[#002244]"
            >
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#003366]">IT Support</h1>
          <p className="text-slate-500 mt-1">Get help with technical issues</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Cards */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-[#003366]/10 flex items-center justify-center mx-auto mb-3">
                <Phone className="h-6 w-6 text-[#003366]" />
              </div>
              <h3 className="font-semibold text-slate-900">Phone Support</h3>
              <p className="text-[#003366] font-mono mt-2">012 393 1000</p>
              <p className="text-xs text-slate-400 mt-1">Mon-Fri 8am-5pm</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-[#003366]/10 flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-[#003366]" />
              </div>
              <h3 className="font-semibold text-slate-900">Email Support</h3>
              <p className="text-[#003366] text-sm mt-2">itsupport@saps.gov.za</p>
              <p className="text-xs text-slate-400 mt-1">Response within 24hrs</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-[#003366]/10 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-[#003366]" />
              </div>
              <h3 className="font-semibold text-slate-900">Emergency</h3>
              <p className="text-[#003366] font-mono mt-2">012 393 1111</p>
              <p className="text-xs text-slate-400 mt-1">24/7 Critical Issues</p>
            </CardContent>
          </Card>
        </div>

        {/* Support Form */}
        <Card className="border-0 shadow-sm mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-[#003366]" />
              Submit a Support Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issue Type</Label>
                <Select
                  value={formData.issue_type}
                  onValueChange={(v) => setFormData(f => ({ ...f, issue_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Login/Access Issue">Login/Access Issue</SelectItem>
                    <SelectItem value="System Error">System Error</SelectItem>
                    <SelectItem value="Data Issue">Data Issue</SelectItem>
                    <SelectItem value="Feature Request">Feature Request</SelectItem>
                    <SelectItem value="Performance Issue">Performance Issue</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData(f => ({ ...f, priority: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Can wait</SelectItem>
                    <SelectItem value="medium">Medium - Need help soon</SelectItem>
                    <SelectItem value="high">High - Urgent</SelectItem>
                    <SelectItem value="critical">Critical - System down</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={(e) => setFormData(f => ({ ...f, subject: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Please describe your issue in detail. Include any error messages you see."
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => submitMutation.mutate()}
                disabled={!formData.issue_type || !formData.subject || !formData.description || submitMutation.isPending}
                className="bg-[#003366] hover:bg-[#002244] gap-2"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}