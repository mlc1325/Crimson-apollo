<!-- LeaseOptimizer.svelte -->
<script lang="ts">
  import { parseCSV, type LeaseRecord } from './csvParser';
  import { optimizeLeases, type OptimizedLease } from './leaseOptimizer';
  import { generatePDF } from './pdfGenerator';

  let file: File | null = null;
  let maxLeasesPerDay: number = 3; // default maximum leases per day
  let leaseRecords: LeaseRecord[] = [];
  let optimizedLeases: OptimizedLease[] = [];
  let distribution: Record<string, number> = {};
  let errorMessage = '';

  // Handles the CSV file input change.
  async function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const selectedFile = target.files[0];
      if (!selectedFile.name.endsWith('.csv')) {
        errorMessage = 'Please select a valid CSV file.';
        return;
      }
      try {
        leaseRecords = await parseCSV(selectedFile);
        const result = optimizeLeases(leaseRecords, maxLeasesPerDay);
        optimizedLeases = result.assignments;
        distribution = result.distribution;
        errorMessage = '';
      } catch (error) {
        errorMessage = 'Error processing CSV file.';
        console.error(error);
      }
    }
  }

  // Updates the optimized leases when the maximum leases per day value changes.
  function handleMaxLeasesChange(event: Event) {
    const target = event.target as HTMLInputElement;
    maxLeasesPerDay = Number(target.value);
    if (leaseRecords.length > 0) {
      const result = optimizeLeases(leaseRecords, maxLeasesPerDay);
      optimizedLeases = result.assignments;
      distribution = result.distribution;
    }
  }

  // Triggers PDF generation.
  function downloadPDF() {
    if (optimizedLeases.length === 0) {
      errorMessage = 'No data available to generate PDF.';
      return;
    }
    generatePDF(optimizedLeases, distribution);
  }
</script>
<style>
  /* Minimal styling for clarity */
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  th {
    background-color: #f2f2f2;
  }
  .error {
    color: red;
    margin-top: 0.5rem;
  }
  label {
    display: block;
    margin-top: 1rem;
  }
  input[type='file'],
  input[type='number'] {
    margin-top: 0.5rem;
  }
  button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
</style>

<div class="container">
  <h1>Lease Optimizer</h1>
  {#if errorMessage}
    <div class="error">{errorMessage}</div>
  {/if}
  <div>
    <label for="fileInput">Upload CSV File:</label>
    <input
      id="fileInput"
      type="file"
      accept=".csv"
      on:change={handleFileChange} />
  </div>
  <div>
    <label for="maxLeases">Max Leases Per Day:</label>
    <input
      id="maxLeases"
      type="number"
      min="1"
      bind:value={maxLeasesPerDay}
      on:input={handleMaxLeasesChange} />
  </div>
  {#if optimizedLeases.length > 0}
    <h2>Preview</h2>
    <table>
      <thead>
        <tr>
          <th>Unit Number</th>
          <th>Original Lease End Date</th>
          <th>Optimized Lease End Date</th>
        </tr>
      </thead>
      <tbody>
        {#each optimizedLeases as lease}
          <tr>
            <td>{lease.unitNumber}</td>
            <td>{lease.originalLeaseEndDate}</td>
            <td>{lease.optimizedLeaseEndDate}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    <button on:click={downloadPDF}>Download PDF Report</button>
  {/if}
</div>