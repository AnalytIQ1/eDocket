import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CaseForm from "@/components/cases/CaseForm";
import { toast } from "sonner";
import { canPerformAction } from "@/components/auth/RolePermissions";

export default function NewCase() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const userRole = user?.saps_role || 'Constable';
  const canCreate = canPerformAction(userRole, 'canCreateCase');

  if (!canCreate && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-amber-100 mb-4">
          <ShieldX className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Access Restricted</h2>
        <p className="text-slate-500 mt-2">Your role ({userRole}) cannot create new cases.</p>
        <Link to={createPageUrl("Cases")} className="mt-4">
          <Button className="bg-[#003366] hover:bg-[#002244]">View Cases</Button>
        </Link>
      </div>
    );
  }

  const generateCaseNumber = () => {
    const provinces = {
      "Gauteng": "GP",
      "Western Cape": "WC",
      "KwaZulu-Natal": "KZN",
      "Eastern Cape": "EC",
      "Free State": "FS",
      "Limpopo": "LP",
      "Mpumalanga": "MP",
      "North West": "NW",
      "Northern Cape": "NC"
    };
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `SAPS-${year}-${random}`;
  };

  const createCaseMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      const caseNumber = generateCaseNumber();
      
      const caseData = {
        ...data,
        case_number: caseNumber,
        status: "Reported",
        reported_date: new Date().toISOString(),
        assigned_officer: user?.email,
        assigned_officer_name: user?.full_name,
        status_history: [{
          status: "Reported",
          date: new Date().toISOString(),
          changed_by: user?.full_name || user?.email
        }]
      };
      
      const createdCase = await base44.entities.Case.create(caseData);
      
      // Log activity
      await base44.entities.ActivityLog.create({
        action_type: "case_created",
        case_id: createdCase.id,
        case_number: caseNumber,
        description: `New ${data.crime_type} case reported in ${data.province}`,
        user_name: user?.full_name || user?.email,
        province: data.province
      });
      
      return createdCase;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success("Case created successfully");
      navigate(createPageUrl("CaseDetails") + `?id=${data.id}`);
    },
    onError: (error) => {
      toast.error("Failed to create case");
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Cases")}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#003366]">
              Report New Case
            </h1>
            <p className="text-slate-500 mt-1">
              Enter the incident details below
            </p>
          </div>
        </div>

        {/* Form */}
        <CaseForm 
          onSubmit={(data) => createCaseMutation.mutate(data)}
          isLoading={createCaseMutation.isPending}
        />
      </div>
    </div>
  );
}