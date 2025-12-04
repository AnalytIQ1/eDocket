import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserCheck, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

export default function AssignOfficerModal({ caseData, open, onClose }) {
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    enabled: open,
  });

  // Filter to show only Constables and Detectives
  const assignableUsers = users.filter(u => 
    ['Constable', 'Detective'].includes(u.saps_role)
  );

  const assignMutation = useMutation({
    mutationFn: async () => {
      const officer = users.find(u => u.email === selectedOfficer);
      const currentUser = await base44.auth.me();
      
      await base44.entities.Case.update(caseData.id, {
        assigned_officer: officer.email,
        assigned_officer_name: officer.full_name,
      });

      await base44.entities.ActivityLog.create({
        action_type: 'case_assigned',
        case_id: caseData.id,
        case_number: caseData.case_number,
        description: `Case ${caseData.case_number} assigned to ${officer.full_name}`,
        user_name: currentUser?.full_name || currentUser?.email,
        province: caseData.province,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', caseData.id] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success("Officer assigned successfully");
      onClose();
    },
    onError: () => {
      toast.error("Failed to assign officer");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#003366]">
            <UserCheck className="h-5 w-5" />
            Assign Investigating Officer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Case Number</p>
            <p className="font-mono font-semibold text-[#003366]">{caseData?.case_number}</p>
          </div>

          <div className="space-y-2">
            <Label>Select Officer</Label>
            <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an officer to assign" />
              </SelectTrigger>
              <SelectContent>
                {assignableUsers.map(user => (
                  <SelectItem key={user.email} value={user.email}>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#003366]" />
                      <span>{user.full_name || user.email}</span>
                      <span className="text-xs text-slate-400">({user.saps_role})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {caseData?.assigned_officer_name && (
            <p className="text-sm text-slate-500">
              Currently assigned to: <span className="font-medium">{caseData.assigned_officer_name}</span>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => assignMutation.mutate()}
            disabled={!selectedOfficer || assignMutation.isPending}
            className="bg-[#003366] hover:bg-[#002244]"
          >
            {assignMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Assign Officer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}