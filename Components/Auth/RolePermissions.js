// SAPS Role-Based Access Control Configuration

export const SAPS_ROLES = {
  CONSTABLE: 'Constable',
  DETECTIVE: 'Detective',
  STATION_COMMANDER: 'Station Commander',
  PROVINCIAL_MINISTER: 'Provincial Minister',
  NATIONAL_MINISTER: 'National Minister',
};

// Define what statuses each role can update cases TO
export const ROLE_STATUS_PERMISSIONS = {
  [SAPS_ROLES.CONSTABLE]: {
    canCreateCase: true,
    canUpdateStatus: ['Reported', 'Under Investigation'],
    canUploadEvidence: true,
    canAddNotes: true,
    canViewAllProvinces: false,
    canGenerateReports: false,
    canDeleteCases: false,
    canAssignOfficers: false,
  },
  [SAPS_ROLES.DETECTIVE]: {
    canCreateCase: true,
    canUpdateStatus: ['Under Investigation', 'Evidence Collection', 'Suspect Identified', 'Awaiting Arrest', 'Arrest Made'],
    canUploadEvidence: true,
    canAddNotes: true,
    canViewAllProvinces: false,
    canGenerateReports: false,
    canDeleteCases: false,
    canAssignOfficers: false,
  },
  [SAPS_ROLES.STATION_COMMANDER]: {
    canCreateCase: true,
    canUpdateStatus: ['Reported', 'Under Investigation', 'Evidence Collection', 'Suspect Identified', 'Awaiting Arrest', 'Arrest Made', 'In Court', 'Solved', 'Closed', 'Cold Case'],
    canUploadEvidence: true,
    canAddNotes: true,
    canViewAllProvinces: false,
    canGenerateReports: true,
    canDeleteCases: true,
    canAssignOfficers: true,
  },
  [SAPS_ROLES.PROVINCIAL_MINISTER]: {
    canCreateCase: false,
    canUpdateStatus: [],
    canUploadEvidence: false,
    canAddNotes: true,
    canViewAllProvinces: false, // Only their province
    canGenerateReports: true,
    canDeleteCases: false,
    canAssignOfficers: false,
  },
  [SAPS_ROLES.NATIONAL_MINISTER]: {
    canCreateCase: false,
    canUpdateStatus: [],
    canUploadEvidence: false,
    canAddNotes: true,
    canViewAllProvinces: true,
    canGenerateReports: true,
    canDeleteCases: false,
    canAssignOfficers: false,
  },
};

// Helper functions
export function getUserPermissions(userRole) {
  return ROLE_STATUS_PERMISSIONS[userRole] || ROLE_STATUS_PERMISSIONS[SAPS_ROLES.CONSTABLE];
}

export function canUpdateToStatus(userRole, targetStatus) {
  const permissions = getUserPermissions(userRole);
  return permissions.canUpdateStatus.includes(targetStatus);
}

export function canPerformAction(userRole, action) {
  const permissions = getUserPermissions(userRole);
  return permissions[action] || false;
}

export function getAvailableStatuses(userRole) {
  const permissions = getUserPermissions(userRole);
  return permissions.canUpdateStatus;
}

// Role descriptions for UI
export const ROLE_DESCRIPTIONS = {
  [SAPS_ROLES.CONSTABLE]: {
    title: 'Constable',
    description: 'Report cases, update to Investigation status, collect evidence',
    color: 'bg-blue-100 text-blue-800',
  },
  [SAPS_ROLES.DETECTIVE]: {
    title: 'Detective',
    description: 'Investigate cases, identify suspects, make arrests',
    color: 'bg-purple-100 text-purple-800',
  },
  [SAPS_ROLES.STATION_COMMANDER]: {
    title: 'Station Commander',
    description: 'Full case management, assign officers, generate reports',
    color: 'bg-amber-100 text-amber-800',
  },
  [SAPS_ROLES.PROVINCIAL_MINISTER]: {
    title: 'Provincial Minister',
    description: 'View provincial statistics, generate ministerial reports',
    color: 'bg-green-100 text-green-800',
  },
  [SAPS_ROLES.NATIONAL_MINISTER]: {
    title: 'National Minister',
    description: 'National oversight, all provinces access, strategic reports',
    color: 'bg-red-100 text-red-800',
  },
};