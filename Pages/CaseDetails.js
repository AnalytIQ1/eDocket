import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ArrowLeft, MapPin, Calendar, User, FileText, 
  MessageSquare, Upload, Clock, Send, Loader2,
  AlertTriangle, Edit
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CaseStatusBadge from "@/components/cases/CaseStatusBadge";
import CasePriorityBadge from "@/components/cases/CasePriorityBadge";
import StatusTimeline from "@/components/cases/StatusTimeline";
import moment from 'moment';
import { toast } from "sonner";
import { getAvailableStatuses, canPerformAction } from "@/components/auth/RolePermissions";
import AssignOfficerModal from "@/components/cases/AssignOfficerModal";

const ALL_STATUSES = [
  "Reported", "Under Investigation", "Evidence Collection", "Suspect Identified",
  "Awaiting Arrest", "Arrest Made", "In Court", "Solved", "Closed", "Cold Case"
];

export default function CaseDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const caseId = urlParams.get('id');
  const queryClient = useQueryClient();
  
  const [newNote, setNewNote] = useState('');
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [user, setUser] = useState(null);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const userRole = user?.saps_role || 'Constable';
  const availableStatuses = getAvailableStatuses(userRole);
  const canUploadEvidence = canPerformAction(userRole, 'canUploadEvidence');
  const canAddNotes = canPerformAction(userRole, 'canAddNotes');
  const canAssignOfficers = canPerformAction(userRole, 'canAssignOfficers');

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => base44.entities.Case.filter({ id: caseId }).then(res => res[0]),
    enabled: !!caseId
  });

  const updateCaseMutation = useMutation({
    mutationFn: async ({ status }) => {
      const user = await base44.auth.me();
      const statusHistory = [...(caseData.status_history || []), {
        status,
        date: new Date().toISOString(),
        changed_by: user?.full_name || user?.email
      }];
      
      await base44.entities.Case.update(caseId, { status, status_history: statusHistory });
      
      await base44.entities.ActivityLog.create({
        action_type: "status_changed",
        case_id: caseId,
        case_number: caseData.case_number,
        description: `Case ${caseData.case_number} status changed to ${status}`,
        user_name: user?.full_name || user?.email,
        province: caseData.province
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success("Status updated successfully");
      setShowStatusChange(false);
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const notes = [...(caseData.case_notes || []), {
        date: new Date().toISOString(),
        author: user?.full_name || user?.email,
        note: newNote
      }];
      
      await base44.entities.Case.update(caseId, { case_notes: notes });
      
      await base44.entities.ActivityLog.create({
        action_type: "note_added",
        case_id: caseId,
        case_number: caseData.case_number,
        description: `Note added to case ${caseData.case_number}`,
        user_name: user?.full_name || user?.email,
        province: caseData.province
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setNewNote('');
      toast.success("Note added successfully");
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <FileText className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900">Case not found</h2>
        <Link to={createPageUrl("Cases")} className="mt-4">
          <Button>Back to Cases</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <Link to={createPageUrl("Cases")}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 font-mono">
                  {caseData.case_number}
                </h1>
                <CasePriorityBadge priority={caseData.priority} />
              </div>
              <p className="text-lg text-slate-600 mt-1">
                {caseData.crime_type}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <CaseStatusBadge status={caseData.status} size="lg" />
            {canAssignOfficers && (
              <Button 
                variant="outline" 
                onClick={() => setShowAssignModal(true)}
                className="border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white"
              >
                <User className="h-4 w-4 mr-2" />
                Assign Officer
              </Button>
            )}
            {availableStatuses.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setShowStatusChange(!showStatusChange)}
                className="border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            )}
          </div>
        </div>

        {/* Status Change Panel */}
        {showStatusChange && availableStatuses.length > 0 && (
          <Card className="mb-6 bg-[#003366]/5 border-[#003366]/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-medium text-slate-700">Change Status to:</span>
                <Select
                  defaultValue={caseData.status}
                  onValueChange={(value) => updateCaseMutation.mutate({ status: value })}
                >
                  <SelectTrigger className="w-[200px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {updateCaseMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <p className="text-xs text-slate-500 w-full">
                  As a {userRole}, you can update to: {availableStatuses.join(', ')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {showStatusChange && availableStatuses.length === 0 && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <p className="text-amber-800">Your role ({userRole}) does not have permission to update case status.</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Details */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Case Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Province</p>
                    <p className="font-medium flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {caseData.province}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">District/Station</p>
                    <p className="font-medium mt-1">{caseData.district || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Incident Date</p>
                    <p className="font-medium flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {moment(caseData.incident_date).format('DD MMM YYYY')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Reported Date</p>
                    <p className="font-medium flex items-center gap-1 mt-1">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {moment(caseData.reported_date).format('DD MMM YYYY')}
                    </p>
                  </div>
                </div>

                {caseData.location_address && (
                  <div>
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="font-medium mt-1">{caseData.location_address}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="mt-1 text-slate-700">{caseData.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {caseData.victim_info && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-600 mb-1">Victim Information</p>
                      <p className="text-sm text-slate-700">{caseData.victim_info}</p>
                    </div>
                  )}
                  {caseData.suspect_info && (
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-orange-600 mb-1">Suspect Description</p>
                      <p className="text-sm text-slate-700">{caseData.suspect_info}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-slate-500">Assigned Officer</p>
                  <p className="font-medium flex items-center gap-1 mt-1">
                    <User className="h-4 w-4 text-slate-400" />
                    {caseData.assigned_officer_name || caseData.assigned_officer || 'Unassigned'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Case Notes */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Case Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Note */}
                <div className="flex gap-3 mb-6">
                  <Textarea
                    placeholder="Add a note to this case..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => addNoteMutation.mutate()}
                    disabled={!newNote.trim() || addNoteMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {addNoteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Notes List */}
                <div className="space-y-4">
                  {caseData.case_notes && caseData.case_notes.length > 0 ? (
                    [...caseData.case_notes].reverse().map((note, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{note.author}</span>
                          <span className="text-xs text-slate-400">
                            {moment(note.date).format('DD MMM YYYY, HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{note.note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-6">No notes yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Case Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatusTimeline 
                  currentStatus={caseData.status}
                  statusHistory={caseData.status_history || []}
                />
              </CardContent>
            </Card>

            {/* Court Date Alert */}
            {caseData.court_date && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Court Date</p>
                      <p className="text-sm text-amber-700 mt-1">
                        {moment(caseData.court_date).format('DD MMMM YYYY')}
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        {moment(caseData.court_date).fromNow()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Assign Officer Modal */}
      <AssignOfficerModal 
        caseData={caseData}
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
      />
    </div>
  );
}