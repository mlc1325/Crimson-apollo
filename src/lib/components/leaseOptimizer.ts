// leaseOptimizer.ts
import { addYears, addDays, format, parseISO } from 'date-fns';
import type { LeaseRecord } from './csvParser';

export interface OptimizedLease {
  unitNumber: number;
  originalLeaseEndDate: string;
  optimizedLeaseEndDate: string;
}

/**
 * Given an array of lease records and a maximum leases per day,
 * returns the optimized lease dates and a summary distribution.
 */
export function optimizeLeases(
  leaseRecords: LeaseRecord[],
  maxLeasesPerDay: number
): { assignments: OptimizedLease[]; distribution: Record<string, number> } {
  const assignments: OptimizedLease[] = [];
  const distribution: Record<string, number> = {};

  // Helper to increment the assignment count for a specific date.
  const incrementAssignment = (dateStr: string) => {
    distribution[dateStr] = (distribution[dateStr] || 0) + 1;
  };
  for (const record of leaseRecords) {
    const originalDate = parseISO(record.leaseEndDate);
    const idealDate = addYears(originalDate, 1);
    let assignedDate = null;
    let offset = 0;
    // Try to assign a date within a year (max offset: 364 days)
    while (offset < 365) {
      if (offset === 0) {
        const candidate = idealDate;
        const candidateStr = format(candidate, 'yyyy-MM-dd');
        if ((distribution[candidateStr] || 0) < maxLeasesPerDay) {
          assignedDate = candidate;
          incrementAssignment(candidateStr);
          break;
        }
      } else {
        // Check idealDate + offset first.
        const candidatePlus = addDays(idealDate, offset);
        const candidatePlusStr = format(candidatePlus, 'yyyy-MM-dd');
        if ((distribution[candidatePlusStr] || 0) < maxLeasesPerDay) {
          assignedDate = candidatePlus;
          incrementAssignment(candidatePlusStr);
          break;
        }
        // Then check idealDate - offset.
        const candidateMinus = addDays(idealDate, -offset);
        const candidateMinusStr = format(candidateMinus, 'yyyy-MM-dd');
        if ((distribution[candidateMinusStr] || 0) < maxLeasesPerDay) {
          assignedDate = candidateMinus;
          incrementAssignment(candidateMinusStr);
          break;
        }
      }
      offset++;
    }
    // Fallback: if no available date found, use the ideal date.
    if (!assignedDate) {
      assignedDate = idealDate;
      incrementAssignment(format(idealDate, 'yyyy-MM-dd'));
    }
    assignments.push({
      unitNumber: record.unitNumber,
      originalLeaseEndDate: format(originalDate, 'yyyy-MM-dd'),
      optimizedLeaseEndDate: format(assignedDate, 'yyyy-MM-dd'),
    });
  }

  return { assignments, distribution };
}