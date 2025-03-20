// csvParser.ts
import Papa from 'papaparse';

export interface LeaseRecord {
  unitNumber: number;
  leaseEndDate: string; // expected format: YYYY-MM-DD
}

/**
 * Parses a CSV file and returns an array of LeaseRecord objects.
 * Assumes the CSV has headers: unitNumber, leaseEndDate.
 */
export function parseCSV(file: File): Promise<LeaseRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Cast and transform each row: convert unitNumber to a number.
        const data = results.data as any[];
        const parsed = data.map((row) => ({
          unitNumber: Number(row.unitNumber),
          leaseEndDate: row.leaseEndDate,
        }));
        resolve(parsed);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}