<script lang="ts">
  import Papa from 'papaparse';
  import dayjs from 'dayjs';
  import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
  import { jsPDF } from 'jspdf';
  import autoTable from 'jspdf-autotable';

  dayjs.extend(isSameOrBefore);

  // Data type for each rent adjustment event
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

  // Initial date range values
  let startMonth = dayjs().subtract(6, 'month').format('YYYY-MM');
  let endMonth = dayjs().add(6, 'month').format('YYYY-MM');

  let selectedExplanation: { unit: string; monthData: any[] } | null = null;

  // ---------------------
  // Helpers
  // ---------------------
  // Splits an array into chunks of a given size
  function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  // ---------------------
  // CSV Upload & Monthly Breakdown Calculation
  // ---------------------
  function handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    closeExplanation();
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

  function calculateMonthlyBreakdown() {
    const groupedByUnit: Record<string, RentAdjustment[]> = {};

    rentData.forEach((item) => {
      if (!groupedByUnit[item.unitNumber]) {
        groupedByUnit[item.unitNumber] = [];
      }
      groupedByUnit[item.unitNumber].push(item);
    });

    monthlyBreakdown = {};

    Object.keys(groupedByUnit).forEach((unit) => {
      let unitData = groupedByUnit[unit];
      // Sort events by letter sent date
      unitData.sort((a, b) => dayjs(a.dateLetterSent).diff(dayjs(b.dateLetterSent)));

      let currentMonth = dayjs(startMonth);
      const lastMonth = dayjs(endMonth);
      monthlyBreakdown[unit] = [];

      while (currentMonth.isSameOrBefore(lastMonth, 'month')) {
        const applicableLetters = unitData.filter(
          (letter) =>
            dayjs(letter.dateEffective).isSameOrBefore(currentMonth, 'month') &&
            dayjs(letter.dateLetterSent).isSameOrBefore(currentMonth.endOf('month'))
        );

        // Build explanation array: all but the last are "Invalidated"; the last is "In Effect"
        const explanation = applicableLetters.map((letter, idx, arr) => ({
          dateLetterSent: letter.dateLetterSent,
          dateEffective: letter.dateEffective,
          residentPortion: letter.residentPortion,
          subsidyPortion: letter.subsidyPortion,
          status: idx < arr.length - 1 ? 'Invalidated' : 'In Effect',
          invalidatedBy: idx < arr.length - 1 ? arr[idx + 1].dateLetterSent : null,
        }));

        const currentLetter = applicableLetters[applicableLetters.length - 1] || null;

        monthlyBreakdown[unit].push({
          month: currentMonth.format('MMM YYYY'),
          residentPortion: currentLetter?.residentPortion || 0,
          subsidyPortion: currentLetter?.subsidyPortion || 0,
          explanation, // raw order; will be re-ordered in PDF rendering
        });

        currentMonth = currentMonth.add(1, 'month');
      }
    });
  }

  function showExplanation(unit, monthData) {
    selectedExplanation = { unit, monthData };
  }

  function closeExplanation() {
    selectedExplanation = null;
  }

  // ---------------------
  // PDF Generation
  // ---------------------
  // Generates the PDF report in portrait orientation with:
  // 1) Monthly Breakdown Tables (6-month chunks, two chunks per page)
  // 2) Explanations: Each unit's explanation starts on a new page.
  //    For each month, the "In Effect" letter is rendered first (highlighted)
  //    with resident/subsidy portions at the far left, followed by any invalidated letters.
  // 3) Timeline & Graphs Section: Up to 5 timelines per page.
  //    Each event is now labeled with its date.
  function generatePDF() {
    const doc = new jsPDF('p', 'pt'); // portrait
    const marginLeft = 30;
    let currentY = 40;
    const pageHeight = doc.internal.pageSize.getHeight();

    // --- Monthly Breakdown Section ---
    doc.setFontSize(12);
    doc.text("Monthly Breakdown Report", marginLeft, currentY);
    currentY += 20;

    // Use first unit's data as reference for month labels (or build from date range)
    const sampleData = Object.values(monthlyBreakdown)[0] || [];
    let allMonths = sampleData.map(md => md.month);
    if (!allMonths.length) {
      let c = dayjs(startMonth);
      const last = dayjs(endMonth);
      while (c.isSameOrBefore(last, 'month')) {
        allMonths.push(c.format('MMM YYYY'));
        c = c.add(1, 'month');
      }
    }
    // Split months into chunks of 6
    const chunkSize = 6;
    const monthChunks = chunkArray(allMonths, chunkSize);

    // Render each pair of 6-month chunks (12 months total) per page
    for (let i = 0; i < monthChunks.length; i += 2) {
      if (i > 0) {
        doc.addPage();
        currentY = 40;
      }
      const topChunk = monthChunks[i];
      currentY = renderMonthTable(doc, topChunk, currentY);
      const bottomChunk = monthChunks[i + 1];
      if (bottomChunk) {
        currentY += 20;
        currentY = renderMonthTable(doc, bottomChunk, currentY);
      }
    }

    // --- Explanations Section ---
    // Each unit's explanation starts on a new page.
    Object.entries(monthlyBreakdown).forEach(([unit, data]) => {
      doc.addPage();
      currentY = 40;
      doc.setFontSize(10);
      doc.text("Explanation for Unit: " + unit, marginLeft, currentY);
      currentY += 16;
      doc.setFontSize(8);
      const availableWidth = doc.internal.pageSize.getWidth() - (marginLeft + 30) - 30;
      const lineHeight = 10;
      
      data.forEach(md => {
        // Reorder so that the effective letter is rendered first.
        const effectiveRow = md.explanation.find(exp => exp.status === "In Effect");
        const invalidatedRows = md.explanation.filter(exp => exp.status === "Invalidated");

        // Estimate block height.
        let blockHeight = 10; // month header
        let effectiveText = effectiveRow
          ? `Resident: ${effectiveRow.residentPortion}, Subsidy: ${effectiveRow.subsidyPortion} | Letter Sent: ${effectiveRow.dateLetterSent}, Effective: ${effectiveRow.dateEffective}, Status: ${effectiveRow.status}`
          : "";
        const effectiveLines = effectiveText ? doc.splitTextToSize(effectiveText, availableWidth) : [];
        blockHeight += effectiveLines.length * lineHeight + 4;
        invalidatedRows.forEach(exp => {
          let txt = `Resident: ${exp.residentPortion}, Subsidy: ${exp.subsidyPortion} | Letter Sent: ${exp.dateLetterSent}, Effective: ${exp.dateEffective}, Status: ${exp.status}` +
            (exp.invalidatedBy ? `, Invalidated By: ${exp.invalidatedBy}` : "");
          const lines = doc.splitTextToSize(txt, availableWidth);
          blockHeight += lines.length * lineHeight + 4;
        });
        if (currentY + blockHeight > pageHeight - 40) {
          doc.addPage();
          currentY = 40;
          doc.setFontSize(10);
          doc.text("Explanation for Unit: " + unit + " (cont.)", marginLeft, currentY);
          currentY += 16;
          doc.setFontSize(8);
        }

        // Render month header
        doc.text(md.month + ":", marginLeft + 15, currentY);
        currentY += 10;

        // Render effective row (highlighted)
        if (effectiveLines.length > 0) {
          const textHeight = effectiveLines.length * lineHeight;
          doc.setFillColor(255, 255, 153);
          doc.rect(marginLeft + 30, currentY - 8, availableWidth, textHeight, 'F');
          doc.setTextColor(0, 0, 0);
          doc.text(effectiveLines, marginLeft + 30, currentY);
          currentY += textHeight + 4;
        }
        // Render invalidated rows
        invalidatedRows.forEach(exp => {
          let txt = `Resident: ${exp.residentPortion}, Subsidy: ${exp.subsidyPortion} | Letter Sent: ${exp.dateLetterSent}, Effective: ${exp.dateEffective}, Status: ${exp.status}` +
              (exp.invalidatedBy ? `, Invalidated By: ${exp.invalidatedBy}` : "");
          const lines = doc.splitTextToSize(txt, availableWidth);
          doc.text(lines, marginLeft + 30, currentY);
          currentY += lines.length * lineHeight + 4;
        });
      });
    });

    // --- Timeline & Graphs Section ---
    // Arrange up to 5 timelines per page.
    doc.addPage();
    currentY = 40;
    doc.setFontSize(12);
    doc.text("Timeline and Graphs", marginLeft, currentY);
    currentY += 20;

    // Group events by unit for timeline charts
    const timelineData: Record<string, RentAdjustment[]> = {};
    rentData.forEach(event => {
      if (!timelineData[event.unitNumber]) timelineData[event.unitNumber] = [];
      timelineData[event.unitNumber].push(event);
    });
    Object.keys(timelineData).forEach(unit => {
      timelineData[unit].sort((a, b) => dayjs(a.dateLetterSent).diff(dayjs(b.dateLetterSent)));
    });
    const timelineUnits = Object.keys(timelineData);
    let timelineCount = 0;
    for (const unit of timelineUnits) {
      if (timelineCount >= 5) {
        doc.addPage();
        currentY = 40;
        timelineCount = 0;
      }
      currentY = renderTimelineForUnit(doc, unit, timelineData[unit], currentY, marginLeft);
      timelineCount++;
      currentY += 20;
    }

    // Save the PDF
    doc.save("report.pdf");
  }

  // Renders a 6-month chunk as a table with a two-row header:
  // Row 1: "Unit Number" (rowSpan=2) and each month (colSpan=2)
  // Row 2: Under each month, "Resident" and "Subsidy"
  // Returns the final Y position after the table.
  function renderMonthTable(doc: jsPDF, chunkMonths: string[], startY: number): number {
    const firstHeaderRow: any[] = [
      { content: "Unit Number", rowSpan: 2, styles: { halign: 'center' } }
    ];
    chunkMonths.forEach(m => {
      firstHeaderRow.push({ content: m, colSpan: 2, styles: { halign: 'center' } });
    });
    const secondHeaderRow: any[] = [];
    chunkMonths.forEach(() => {
      secondHeaderRow.push({ content: "Resident", styles: { halign: 'center' } });
      secondHeaderRow.push({ content: "Subsidy", styles: { halign: 'center' } });
    });
    const bodyRows: any[] = [];
    Object.entries(monthlyBreakdown).forEach(([unit, data]) => {
      const rowCells: any[] = [unit];
      chunkMonths.forEach(m => {
        const md = data.find(d => d.month === m);
        if (md) {
          rowCells.push(md.residentPortion);
          rowCells.push(md.subsidyPortion);
        } else {
          rowCells.push("");
          rowCells.push("");
        }
      });
      bodyRows.push(rowCells);
    });
    autoTable(doc, {
      startY,
      theme: 'grid',
      head: [ firstHeaderRow, secondHeaderRow ],
      body: bodyRows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontSize: 8 },
      columnStyles: { 0: { cellWidth: 80 } },
      tableWidth: 'wrap'
    });
    return doc.lastAutoTable.finalY;
  }

  // Renders a timeline graph for a given unit.
  // Draws a horizontal time axis, labels months (with full year on the first and every January),
  // and for each event draws markers for the letter received and effective dates,
  // each labeled with its date.
  function renderTimelineForUnit(
    doc: jsPDF,
    unit: string,
    events: RentAdjustment[],
    startY: number,
    marginLeft: number
  ): number {
    let currentY = startY;
    doc.setFontSize(10);
    doc.text("Timeline for Unit: " + unit, marginLeft, currentY);
    currentY += 14;
    // Determine overall date range
    let minDate = dayjs(events[0].dateLetterSent);
    let maxDate = dayjs(events[0].dateEffective);
    events.forEach(ev => {
      const dLetter = dayjs(ev.dateLetterSent);
      const dEffective = dayjs(ev.dateEffective);
      if (dLetter.isBefore(minDate)) minDate = dLetter;
      if (dEffective.isBefore(minDate)) minDate = dEffective;
      if (dLetter.isAfter(maxDate)) maxDate = dLetter;
      if (dEffective.isAfter(maxDate)) maxDate = dEffective;
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const availableWidth = pageWidth - 2 * marginLeft;
    const timelineY = currentY + 20;
    doc.setDrawColor(0, 0, 0);
    doc.line(marginLeft, timelineY, marginLeft + availableWidth, timelineY);

    let totalDays = maxDate.diff(minDate, 'days');
    if (totalDays === 0) totalDays = 1;

    // Label months along the timeline
    let pointer = minDate.startOf('month');
    while (pointer.isBefore(maxDate) || pointer.isSame(maxDate)) {
      const x = marginLeft + (pointer.diff(minDate, 'days') / totalDays) * availableWidth;
      let label = pointer.format('MMM');
      if (pointer.isSame(minDate.startOf('month'))) {
        label = pointer.format('MMM YYYY');
      } else if (pointer.month() === 0) {
        label = pointer.format('MMM YYYY');
      }
      doc.setFontSize(8);
      doc.text(label, x, timelineY + 30, { align: 'center' });
      pointer = pointer.add(1, 'month');
    }

    // Draw markers for each event with date labels
    events.forEach(ev => {
      const letterDate = dayjs(ev.dateLetterSent);
      const effectiveDate = dayjs(ev.dateEffective);
      const xLetter = marginLeft + (letterDate.diff(minDate, 'days') / totalDays) * availableWidth;
      const xEffective = marginLeft + (effectiveDate.diff(minDate, 'days') / totalDays) * availableWidth;
      // Draw letter marker (above the line)
      doc.setFillColor(0, 0, 0);
      doc.circle(xLetter, timelineY - 10, 3, 'F');
      doc.setFontSize(8);
      // Label letter marker with its date
      doc.text(letterDate.format('MMM D'), xLetter, timelineY - 15, { align: 'center' });
      // Draw effective marker (below the line)
      doc.circle(xEffective, timelineY + 10, 3, 'F');
      doc.text(effectiveDate.format('MMM D'), xEffective, timelineY + 20, { align: 'center' });
      // Draw connecting line
      doc.line(xLetter, timelineY - 10, xEffective, timelineY + 10);
    });
    currentY = timelineY + 40;
    return currentY;
  }
</script>

<!-- Svelte Markup -->
<div class="container">
  <!-- Controls -->
  <div class="controls">
    <div class="date-range">
      <label for="startMonth">Start Month:</label>
      <input id="startMonth" type="month" bind:value={startMonth} on:change={calculateMonthlyBreakdown} />
      <label for="endMonth">End Month:</label>
      <input id="endMonth" type="month" bind:value={endMonth} on:change={calculateMonthlyBreakdown} />
    </div>
    <input type="file" accept=".csv" on:change={handleFileUpload} />
    {#if errorMessage}
      <p class="text-error">{errorMessage}</p>
    {/if}
    <button class="btn" on:click={generatePDF}>Generate PDF Report</button>
  </div>

  <!-- (Optional) UI Table Display -->
  <table>
    <thead>
      <tr>
        <th>Unit</th>
        <th>Month</th>
        <th>Resident</th>
        <th>Subsidy</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      {#each Object.entries(monthlyBreakdown) as [unit, data]}
        {#each data as md}
          <tr>
            <td>{unit}</td>
            <td>{md.month}</td>
            <td>{md.residentPortion}</td>
            <td>{md.subsidyPortion}</td>
            <td>
              <button on:click={() => showExplanation(unit, data)}>Explain</button>
            </td>
          </tr>
        {/each}
      {/each}
    </tbody>
  </table>

  <!-- Explanation Modal -->
  {#if selectedExplanation}
    <div class="modal">
      <div class="modal-box">
        <h3>Explanation for Unit {selectedExplanation.unit}</h3>
        <div class="modal-table">
          <table class="table table-sm table-bordered">
            <thead>
              <tr>
                <th>Month</th>
                <th>Date Letter Sent</th>
                <th>Date Effective</th>
                <th>Resident Portion</th>
                <th>Subsidy Portion</th>
                <th>Status</th>
                <th>Invalidated By</th>
              </tr>
            </thead>
            <tbody>
              {#each selectedExplanation.monthData as md}
                {#each md.explanation as exp, idx}
                  <tr>
                    {#if idx === 0}
                      <td rowspan={md.explanation.length}>{md.month}</td>
                    {/if}
                    <td>{exp.dateLetterSent}</td>
                    <td>{exp.dateEffective}</td>
                    <td>{exp.residentPortion}</td>
                    <td>{exp.subsidyPortion}</td>
                    <td>{exp.status}</td>
                    <td>{exp.invalidatedBy || '-'}</td>
                  </tr>
                {/each}
              {/each}
            </tbody>
          </table>
        </div>
        <div class="modal-action">
          <button class="btn" on:click={closeExplanation}>Close</button>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Styles -->
<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    box-sizing: border-box;
  }
  .controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .date-range {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
  }
  input[type="file"],
  input[type="month"] {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.3);
    background: rgba(0,0,0,0.3);
    color: #fff;
  }
  .text-error {
    color: #ff3366;
    font-weight: bold;
    font-size: 0.9rem;
  }
  button {
    padding: 0.5rem 1rem;
    cursor: pointer;
    border: none;
    border-radius: 6px;
    background: #007acc;
    color: #fff;
  }
  table {
    border-collapse: collapse;
    margin-top: 1rem;
    width: 100%;
    font-size: 0.9rem;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 0.5rem;
    text-align: center;
  }
  .modal {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal-box {
    background-color: #fff;
    color: #000;
    border-radius: 8px;
    padding: 1rem;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
  }
  .modal-box h3 {
    margin-top: 0;
    font-size: 1.2rem;
  }
  .table.table-sm.table-bordered {
    width: 100%;
    border-collapse: collapse;
  }
  .table.table-sm.table-bordered th,
  .table.table-sm.table-bordered td {
    border: 1px solid #999;
    padding: 0.5rem;
    text-align: center;
  }
</style>
