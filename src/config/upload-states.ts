import type { StateGroupConfig } from '@/types/upload-file';

export const stateGroups: StateGroupConfig[] = [
  {
    id: 'active',
    label: 'In Progress',
    description: 'Files currently being uploaded or processed',
    priority: 100,
    statuses: ['uploading', 'queued', 'processing', 'connecting'],
    badgeColor: 'gray-blue',
  },
  {
    id: 'needs-review',
    label: 'Needs Review',
    description: 'Matched with issues that need your attention',
    priority: 90,
    statuses: ['success-with-caveats'],
    badgeColor: 'warning',
  },
  {
    id: 'ready',
    label: 'Ready to Export',
    description: 'Successfully processed and ready for export',
    priority: 80,
    statuses: ['success'],
    badgeColor: 'brand',
  },
  {
    id: 'errors',
    label: 'Errors',
    description: 'Files that encountered problems',
    priority: 70,
    statuses: ['error', 'processing-error', 'duplicate', 'no-match'],
    badgeColor: 'error',
  },
  {
    id: 'completed',
    label: 'Exported',
    description: 'Successfully exported to AIM',
    priority: 60,
    statuses: ['exported'],
    badgeColor: 'success',
  },
];

