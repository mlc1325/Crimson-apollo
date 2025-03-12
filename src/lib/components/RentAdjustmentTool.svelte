<script lang="ts">
  import { onMount } from 'svelte';
  import Papa from 'papaparse';
  import fileSaver from 'file-saver';
  import dayjs from 'dayjs';
  import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

  dayjs.extend(isSameOrBefore);

  type RentAdjustment = {
    unitNumber: string;
    dateLetterSent: string;
    dateEffective: string;
    residentPortion: number;
    subsidyPortion: number;
  };

  let rentData: RentAdjustment[] = [];
  let monthlyBreakdown: Record<string, any[]> = {};
  let errorMessage = '';
  let startMonth = dayjs().subtract(6, 'month').format('YYYY-MM');
  let endMonth = dayjs().add(6, 'month').format('YYYY-MM');

  function handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          errorMessage = 'Error parsing CSV file. Please check the file format.';
          return;
        }
        rentData = results.data.map((row: any) => ({
          unitNumber: row['Unit Number'],
          dateLetterSent: row['Date Letter Sent'],
          dateEffective: row['Date Effective'],
          residentPortion: parseFloat(row['Resident Portion']) || 0,
          subsidyPortion: parseFloat(row['Subsidy Portion']) || 0,
        }));
        calculateMonthlyBreakdown();
      },
    });
  }

  function downloadTemplateCSV() {
    const templateData = [
      ["Unit Number", "Date Letter Sent", "Date Effective", "Resident Portion", "Subsidy Portion"],
      ["101", "2024-01-01", "2024-02-01", "500", "700"],
      ["102", "2024-02-05", "2024-03-01", "600", "600"],
      ["103", "2024-03-10", "2024-04-01", "550", "650"]
    ];
    
    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    fileSaver.saveAs(blob, 'rent_adjustment_template.csv');
  }

  function calculateMonthlyBreakdown() {
  const groupedByUnit: Record<string, RentAdjustment[]> = {};

  // Group by unit
  rentData.forEach((item) => {
    if (!groupedByUnit[item.unitNumber]) {
      groupedByUnit[item.unitNumber] = [];
    }
    groupedByUnit[item.unitNumber].push(item);
  });

  monthlyBreakdown = {};

  Object.keys(groupedByUnit).forEach((unit) => {
    let unitData = groupedByUnit[unit];

    // Sort by dateEffective ASC, then dateLetterSent DESC (latest letter takes precedence)
    unitData.sort((a, b) => {
      const effectiveComparison = dayjs(a.dateEffective).diff(dayjs(b.dateEffective));
      if (effectiveComparison !== 0) return effectiveComparison;
      return dayjs(b.dateLetterSent).diff(dayjs(a.dateLetterSent));
    });

    let currentLetter: RentAdjustment | null = null;
    let currentMonth = dayjs(startMonth);
    let lastMonth = dayjs(endMonth);

    while (currentMonth.isBefore(lastMonth) || currentMonth.isSame(lastMonth, 'month')) {
      // Determine which letter is in effect for the current month
      for (let letter of unitData) {
        if (dayjs(letter.dateEffective).isSameOrBefore(currentMonth, 'month')) {
          currentLetter = letter;
        } else {
          break;
        }
      }

      // Store only if we have a valid effective letter
      if (currentLetter) {
        if (!monthlyBreakdown[unit]) {
          monthlyBreakdown[unit] = [];
        }
        monthlyBreakdown[unit].push({
          month: currentMonth.format('MMM YYYY'),
          residentPortion: currentLetter.residentPortion,
          subsidyPortion: currentLetter.subsidyPortion,
          totalAmount: currentLetter.residentPortion + currentLetter.subsidyPortion,
        });
      }

      // Move to the next month
      currentMonth = currentMonth.add(1, 'month');
    }
  });
}

</script>

<div class="card">
  <h1>Monthly Rent Breakdown Tool</h1>
  <label for="csvFileInput">Select a CSV file:</label>
  <input id="csvFileInput" type="file" accept=".csv" on:change={handleFileUpload} />
  <button on:click={downloadTemplateCSV}>Download Template CSV</button>
  {#if errorMessage}<p class="error">{errorMessage}</p>{/if}
  
  <div class="filters">
    <label>Start Month:</label>
    <input type="month" bind:value={startMonth} />
    <label>End Month:</label>
    <input type="month" bind:value={endMonth} />
    <button on:click={calculateMonthlyBreakdown}>Calculate</button>
  </div>

  {#each Object.keys(monthlyBreakdown) as unit}
    <details>
      <summary>Unit {unit}</summary>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Resident Portion</th>
            <th>Subsidy Portion</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {#each monthlyBreakdown[unit] as item}
            <tr>
              <td>{item.month}</td>
              <td>{item.residentPortion}</td>
              <td>{item.subsidyPortion}</td>
              <td>{item.totalAmount}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </details>
  {/each}
</div>

