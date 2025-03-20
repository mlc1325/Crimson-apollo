<script>
    import Papa from 'papaparse';
    import { jsPDF } from "jspdf";
    import html2canvas from "html2canvas";
  
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  
    let csvData = [];
    let monthlyGoals = Array(12).fill(5);
    let currentYear = new Date().getFullYear();
    let nextYear = currentYear + 1;
  
    // Parse CSV and filter out rows with invalid dates.
    function handleFileInput(event) {
      const file = event.target.files[0];
      if (!file) return;
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          csvData = results.data
            .map(row => {
              const parsedDate = new Date(row["lease end date"]);
              if (isNaN(parsedDate.getTime())) {
                console.warn(`Invalid lease end date for unit ${row["Unit number"]}: ${row["lease end date"]}`);
                return null;
              }
              return {
                unit: row["Unit number"],
                leaseEnd: parsedDate
              };
            })
            .filter(item => item !== null)
            .sort((a, b) => a.leaseEnd - b.leaseEnd);
        },
        error: function (err) {
          console.error("Error parsing CSV: ", err);
        }
      });
    }
  
    // Returns all Mondays in the given month and year.
    function getMondays(year, month) {
      let mondays = [];
      let date = new Date(year, month, 1);
      let iterations = 0;
      while (date.getDay() !== 1 && iterations < 10) {
        date.setDate(date.getDate() + 1);
        iterations++;
      }
      if (iterations >= 10) {
        console.warn(`Could not find a Monday for ${monthNames[month]} ${year} in 10 iterations.`);
        return mondays;
      }
      while (date.getMonth() === month) {
        mondays.push(new Date(date));
        date.setDate(date.getDate() + 7);
      }
      return mondays;
    }
  
    /**
     * Helper: Capture HTML content as an image and add it to the PDF.
     * We set a wide container (e.g. 2000px), remove overflow restrictions,
     * and force a white background to ensure everything is rendered and visible.
     */
    async function addHtmlAsImageToPDF(htmlContent, doc, addNewPage = false) {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-99999px';
      container.style.left = '-99999px';
      container.style.width = '2000px';
      container.style.backgroundColor = '#fff';  // Force white background
      container.style.color = '#000';            // Force black text
      container.style.overflow = 'visible';      // Ensure table isn't clipped
      container.innerHTML = htmlContent;
      document.body.appendChild(container);
  
      // Wait briefly for rendering.
      await new Promise(resolve => setTimeout(resolve, 600));
  
      // Capture with html2canvas.
      const canvas = await html2canvas(container, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
  
      // Calculate how to fit the image on an A4 page in landscape.
      const pdfWidth = doc.internal.pageSize.getWidth();  // e.g. 297 mm for A4 landscape
      const pdfHeight = doc.internal.pageSize.getHeight(); // e.g. 210 mm for A4 landscape
  
      let imgWidth = pdfWidth;
      let imgHeight = (canvas.height * pdfWidth) / canvas.width;
      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = (canvas.width * pdfHeight) / canvas.height;
      }
  
      if (addNewPage) {
        doc.addPage();
      }
  
      doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  
      // Clean up the off-screen container.
      document.body.removeChild(container);
    }
  
    // Build HTML for the first table: Current Year Lease End Dates.
    function buildCurrentYearTable() {
      // Group CSV data by month for the current year.
      let currentYearData = Array.from({ length: 12 }, () => []);
      csvData.forEach(unitObj => {
        if (unitObj.leaseEnd.getFullYear() === currentYear) {
          let month = unitObj.leaseEnd.getMonth();
          // Include unit number and lease end date (YYYY-MM-DD).
          currentYearData[month].push(`${unitObj.unit} (${unitObj.leaseEnd.toISOString().split('T')[0]})`);
        }
      });
      let maxRows = Math.max(...currentYearData.map(arr => arr.length));
      let tableRows = "";
      for (let i = 0; i < maxRows; i++) {
        let rowCells = "";
        for (let m = 0; m < 12; m++) {
          rowCells += `<td style="text-align:center;">${currentYearData[m][i] || ""}</td>`;
        }
        tableRows += `<tr>${rowCells}</tr>`;
      }
  
      return `
        <div style="
          font-family: sans-serif;
          padding: 10px;
          width: 2000px;
          background-color: #fff;
          color: #000;
        ">
           <h2 style="text-align:center;">Current Year Lease End Dates (${currentYear})</h2>
           <table border="1" cellspacing="0" cellpadding="5"
                  style="border-collapse: collapse; width: 100%; table-layout: fixed;">
              <thead>
                 <tr>
                   ${monthNames.map(m => `<th style="text-align:center;">${m}</th>`).join('')}
                 </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
           </table>
        </div>
      `;
    }
  
    // Build HTML for the second table: Lease Recommendation for Next Year.
    function buildLeaseRecommendationTable() {
      let recommendedAssignments = Array.from({ length: 12 }, () => []);
      let monthCounts = Array(12).fill(0);
  
      csvData.forEach(unitObj => {
        let desired = unitObj.leaseEnd.getMonth();
        let assignedMonth = desired;
  
        // Decide which month to assign based on monthly goals.
        if (monthCounts[desired] < Number(monthlyGoals[desired])) {
          assignedMonth = desired;
        } else if (desired > 0 && monthCounts[desired - 1] < Number(monthlyGoals[desired - 1])) {
          assignedMonth = desired - 1;
        } else if (desired < 11 && monthCounts[desired + 1] < Number(monthlyGoals[desired + 1])) {
          assignedMonth = desired + 1;
        } else {
          assignedMonth = desired;
        }
        monthCounts[assignedMonth] += 1;
  
        // Find Mondays in the assigned month.
        let mondays = getMondays(nextYear, assignedMonth);
        if (mondays.length === 0) {
          console.warn(`No Mondays found for ${monthNames[assignedMonth]} ${nextYear}`);
          return;
        }
  
        // Distribute assignments evenly across Mondays.
        let mondayIndex = (monthCounts[assignedMonth] - 1) % mondays.length;
        let recommendedDate = mondays[mondayIndex];
        let recommendedDateStr = recommendedDate.toISOString().split('T')[0];
  
        recommendedAssignments[assignedMonth].push({
          unit: unitObj.unit,
          recommendedDate: recommendedDateStr
        });
      });
  
      let maxRows = Math.max(...recommendedAssignments.map(arr => arr.length));
      let tableRows = "";
      for (let i = 0; i < maxRows; i++) {
        let rowCells = "";
        for (let m = 0; m < 12; m++) {
          if (recommendedAssignments[m][i]) {
            rowCells += `<td style="text-align:center;">${recommendedAssignments[m][i].unit} (${recommendedAssignments[m][i].recommendedDate})</td>`;
          } else {
            rowCells += `<td style="text-align:center;"></td>`;
          }
        }
        tableRows += `<tr>${rowCells}</tr>`;
      }
  
      return `
        <div style="
          font-family: sans-serif;
          padding: 10px;
          width: 2000px;
          background-color: #fff;
          color: #000;
        ">
           <h2 style="text-align:center;">Lease Recommendation for Next Year (${nextYear})</h2>
           <table border="1" cellspacing="0" cellpadding="5"
                  style="border-collapse: collapse; width: 100%; table-layout: fixed;">
              <thead>
                 <tr>
                   ${monthNames.map(m => `<th style="text-align:center;">${m}</th>`).join('')}
                 </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
           </table>
        </div>
      `;
    }
  
    // Generate the PDF in landscape orientation, each table on its own page.
    async function generatePDF() {
      // "l" for landscape, "mm" for units, "a4" for page size.
      const doc = new jsPDF("l", "mm", "a4");
  
      // Build each table's HTML.
      const currentYearHtml = buildCurrentYearTable();
      const leaseRecHtml = buildLeaseRecommendationTable();
  
      // Add the first table to page 1.
      await addHtmlAsImageToPDF(currentYearHtml, doc, false);
      // Add the second table to page 2.
      await addHtmlAsImageToPDF(leaseRecHtml, doc, true);
  
      // Save the resulting PDF.
      doc.save("leases.pdf");
    }
  </script>
  
  <style>
    .container {
      padding: 1em;
      font-family: sans-serif;
    }
    .input-group {
      margin-bottom: 1em;
    }
    .month-input {
      display: flex;
      align-items: center;
      margin-bottom: 0.5em;
    }
    .month-input label {
      width: 100px;
    }
    button {
      padding: 0.5em 1em;
      font-size: 1rem;
    }
  </style>
  
  <div class="container">
    <h1>Lease PDF Generator</h1>
    <!-- CSV File Input -->
    <div class="input-group">
      <label for="csvFile">Upload CSV File:</label>
      <input id="csvFile" type="file" accept=".csv" on:change={handleFileInput} />
    </div>
  
    <!-- Monthly Goal Inputs -->
    <div class="input-group">
      <h2>Monthly Goals (Max Leases Allowed)</h2>
      {#each monthNames as month, index}
        <div class="month-input">
          <label>{month}:</label>
          <input
            type="number"
            min="0"
            bind:value={monthlyGoals[index]}
            placeholder="Goal for {month}"
          />
        </div>
      {/each}
    </div>
  
    <!-- Button to trigger PDF generation -->
    <button on:click={generatePDF}>Generate PDF</button>
  </div>
  