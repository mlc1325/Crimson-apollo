<!--
  DeliLetter.svelte
  -----------------
  A Svelte component for generating PDF letters from CSV data.
  It uses jsPDF for PDF generation and PapaParse to parse CSV files.
  The front page summarizes the sent letters (date, unit, balance, letter type).
-->

<script lang="ts">
    import { jsPDF } from 'jspdf';
    import Papa from 'papaparse';
  
    let fakeDB: any[] = [];
    let balanceThreshold: number = 0;
  
    interface PropertyInfo {
      id: string;
      propertyName: string;
      streetAddress: string;
      cityStateZip: string;
      propertyPhoneNumber: string;
      mailingAddress: string;
    }
  
    const propertyInfo: PropertyInfo[] = [
      {
        id: "WS",
        propertyName: "Woodland Springs Apartments",
        streetAddress: "3111 S Leonard Springs Rd",
        cityStateZip: "Bloomington, IN 47403",
        propertyPhoneNumber: "812-336-5603",
        mailingAddress: "3111 S Leonard Springs Rd Bloomington, IN 47403",
      },
      {
        id: "SP",
        propertyName: "Summit Pointe Apartments",
        streetAddress: "701 Summitview Place",
        cityStateZip: "Bloomington, IN 47401",
        propertyPhoneNumber: "812-822-3034",
        mailingAddress: "701 Summitview Place Bloomington, IN 47401",
      },
      {
        id: "BW",
        propertyName: "Basswood Apartments",
        streetAddress: "1000 S Basswood Circle",
        cityStateZip: "Bloomington, IN 47403",
        propertyPhoneNumber: "812-333-9123",
        mailingAddress: "1000 S Basswood Circle Bloomington, IN 47403",
      },
      {
        id: "KM",
        propertyName: "Kingston Manor Apartments",
        streetAddress: "3200 E Longview Ave",
        cityStateZip: "Bloomington, IN 47408",
        propertyPhoneNumber: "812-822-0812",
        mailingAddress: "701 Summitview Place Bloomington, IN 47401",
      },
      {
        id: "NC",
        propertyName: "Northcrest Apartments",
        streetAddress: "1440 N Woodburn Ave",
        cityStateZip: "Bloomington, IN 47404",
        propertyPhoneNumber: "812-822-3178",
        mailingAddress: "701 Summitview Place Bloomington, IN 47401",
      },
      {
        id: "EL",
        propertyName: "El Dorado Apartments",
        streetAddress: "3621 Lawnview Lane",
        cityStateZip: "Indianapolis, IN 46222",
        propertyPhoneNumber: "317-636-7700",
        mailingAddress: "3621 Lawnview Lane Indianapolis, IN 46222",
      },
    ];
  
    let selectedPropertyId: string = propertyInfo[0].id;
  
    const fontSizes = {
      h3: 18,
      pp: 12,
    };
  
    const paper = {
      orientation: 'p',
      unit: 'pt',
      size: 'letter',
      ppi: 72,
      width: 8.5 * 72,
      height: 11 * 72,
    };
  
    const margin = {
      left: 1 * paper.ppi,
      top: 1 * paper.ppi,
      right: 1 * paper.ppi,
      bottom: 1 * paper.ppi,
    };
  
    let paperCenter = paper.width / 2;
    const textConfig = { maxWidth: paper.width - (margin.left + margin.right) };
  
    // PDF letter functions
    function NTQPDF(doc: jsPDF, account: any, property: PropertyInfo) {
      let y = margin.top;
      const formattedBalance = parseFloat(account.balance).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      const today = new Date();
  
      doc.setFontSize(fontSizes.pp);
      doc.setFont("times", "underlined");
  
      doc.text(property.propertyName, margin.left, y, textConfig);
      y += doc.getLineHeight();
      doc.text(property.streetAddress, margin.left, y, textConfig);
      y += doc.getLineHeight();
      doc.text(property.cityStateZip, margin.left, y, textConfig);
      y += doc.getLineHeight();
      doc.text(property.propertyPhoneNumber, margin.left, y, textConfig);
      y += doc.getLineHeight();
      y += doc.getLineHeight();
  
      doc.text("Date: " + new Date().toLocaleDateString('en-US'), margin.left, y, textConfig);
      y += doc.getLineHeight();
      doc.text("Unit: " + account.unitNumber, margin.left, y, textConfig);
      y += doc.getLineHeight();
      doc.text("Resident: " + account.name, margin.left, y, textConfig);
  
      y += doc.getLineHeight() * 3;
  
      doc.setFontSize(fontSizes.h3);
      doc.setFont("times");
  
      const title = "Notice to Vacate for Nonpayment";
      doc.text(title, paperCenter, y, { ...textConfig, align: "center" });
  
      y += doc.getLineHeight();
      doc.setFontSize(fontSizes.pp);
  
      doc.text("Dear Resident,", margin.left, y, textConfig);
      y += doc.getLineHeight();
  
      const nonComplianceText =
        "          You are hereby notified that you are not complying with your lease in that you are late on your rent for the payment(s)" +
        ` of ${formattedBalance} due on ${today.getMonth() + 1}/1/${today.getFullYear()}`;
      doc.text(nonComplianceText, margin.left, y, textConfig);
      y += doc.getLineHeight() * 3;
  
      doc.text(
        "You have 10 days ending on " +
          new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US') +
          " to make payment in full to the following:",
        margin.left,
        y,
        textConfig
      );
      y += doc.getLineHeight() * 2;
  
      doc.text("Payable to: " + property.propertyName, margin.left * 2, y, textConfig);
      y += doc.getLineHeight();
      doc.text("Address: " + property.mailingAddress, margin.left * 2, y, textConfig);
      y += doc.getLineHeight() * 3;
  
      doc.setFontSize(fontSizes.h3, "bold");
      doc.text("Or vacate the premises", paperCenter, y, undefined, undefined, "center");
      y += doc.getLineHeight() * 2;
  
      doc.setFontSize(fontSizes.pp, "bold");
      doc.text("Please note that late fees are assessed on the 6th and the 10th of each month.", margin.left, y);
      y += doc.getLineHeight();
      doc.text("- on the 6th your balance will be: $" + parseFloat(account.balance + 50).toFixed(2), margin.left * 1.5, y);
      y += doc.getLineHeight();
      doc.text("- on the 10th your balance will be: $" + parseFloat(account.balance + 125).toFixed(2), margin.left * 1.5, y);
      y += doc.getLineHeight() * 4;
  
      doc.setFontSize(fontSizes.pp, "normal");
    }
  
    function SBPDF(doc: jsPDF, account: any, property: PropertyInfo) {
      let y = margin.top;
      const formattedBalance = parseFloat(account.balance).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      const today = new Date();
  
      doc.setFontSize(fontSizes.pp);
      doc.setFont("times", "underlined");
  
      doc.text(property.propertyName, margin.left, y, textConfig);
      y += doc.getLineHeight();
      doc.text(property.streetAddress, margin.left, y, textConfig);
      y += doc.getLineHeight();
      doc.text(property.cityStateZip, margin.left, y, textConfig);
      y += doc.getLineHeight();
      doc.text(property.propertyPhoneNumber, margin.left, y, textConfig);
      y += doc.getLineHeight();
      y += doc.getLineHeight();
  
      doc.text("Date: " + new Date().toLocaleDateString('en-US'), margin.left, y, textConfig);
      y += doc.getLineHeight();
      doc.text("Unit: " + account.unitNumber, margin.left, y, textConfig);
      y += doc.getLineHeight();
      doc.text("Resident: " + account.name, margin.left, y, textConfig);
  
      y += doc.getLineHeight() * 3;
  
      doc.setFontSize(fontSizes.h3);
      doc.setFont("times");
  
      const title = "Notice of current balance";
      doc.text(title, paperCenter, y, { ...textConfig, align: "center" });
  
      y += doc.getLineHeight();
      doc.setFontSize(fontSizes.pp);
  
      doc.text("Dear Resident,", margin.left, y, textConfig);
      y += doc.getLineHeight();
  
      const nonComplianceText =
        "          You are hereby notified that you currently have a balance" +
        ` of ${formattedBalance}. Please resolve this promptly to avoid late fees and any other possible actions or remedys. Please note that we only accept payment in full. Any future rent will not be accepted until this is fulfilled.`;
      doc.text(nonComplianceText, margin.left, y, textConfig);
      y += doc.getLineHeight() * 3;
  
      y += doc.getLineHeight();
  
      doc.text("Payable to: " + property.propertyName, margin.left * 2, y, textConfig);
      y += doc.getLineHeight();
      doc.text("Address: " + property.mailingAddress, margin.left * 2, y, textConfig);
      y += doc.getLineHeight() * 3;
  
      doc.setFontSize(fontSizes.h3, "bold");
      doc.setFontSize(fontSizes.pp, "bold");
      doc.text("Please note that late fees are assessed on the 6th ($50.00) and the 10th ($75.00) of each month.", margin.left, y);
      y += doc.getLineHeight();
      doc.text("- on the 6th your balance will be: $" + parseFloat(account.balance + 50).toFixed(2), margin.left * 1.5, y);
      y += doc.getLineHeight();
      doc.text("- on the 10th your balance will be: $" + parseFloat(account.balance + 125).toFixed(2), margin.left * 1.5, y);
      y += doc.getLineHeight() * 4;
  
      doc.setFontSize(fontSizes.pp, "normal");
    }
  
    // New function to add a front page summary that includes the balance
    function addFrontPage(doc: jsPDF) {
      let y = margin.top;
      // Title
      doc.setFontSize(24);
      doc.text("Letter Summary", paperCenter, y, { align: "center" });
      y += 30;
      // Today's date
      doc.setFontSize(12);
      const todayStr = new Date().toLocaleDateString('en-US');
      doc.text(`Sent on: ${todayStr}`, margin.left, y);
      y += 20;
      // Table header: Unit, Balance, Letter Type
      doc.text("Unit", margin.left, y);
      doc.text("Balance", margin.left + 70, y);
      doc.text("Letter Type", margin.left + 140, y);
      y += 15;
      // List each unit, balance, and letter type based on balance threshold
      fakeDB.forEach((account) => {
        const letterType = account.balance > balanceThreshold 
          ? "Notice to Vacate for Nonpayment" 
          : "Notice of current balance";
        const formattedBalance = parseFloat(account.balance).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        doc.text(`${account.unitNumber}`, margin.left, y);
        doc.text(`${formattedBalance}`, margin.left + 70, y);
        doc.text(letterType, margin.left + 140, y);
        y += 15;
      });
      // Add a new page after the front page
      doc.addPage();
    }
  
    // Updated generateLetters to include the front page summary
    const generateLetters = () => {
      const property = propertyInfo.find(p => p.id === selectedPropertyId);
      if (!property) return;
      const doc = new jsPDF(paper.orientation, paper.unit, paper.size, true);
  
      // Add the front page summary
      addFrontPage(doc);
  
      // Distribution Copy
      doc.text("Distribution", paperCenter, 200, { align: "center" });
      fakeDB.forEach(account => {
        if (account.balance > balanceThreshold) {
          doc.addPage();
          NTQPDF(doc, account, property);
        } else {
          doc.addPage();
          SBPDF(doc, account, property);
        }
      });
  
      // Office Copy
      doc.addPage();
      doc.text("Office Copy", paperCenter, 200, { align: "center" });
      fakeDB.forEach(account => {
        if (account.balance > balanceThreshold) {
          doc.addPage();
          NTQPDF(doc, account, property);
        } else {
          doc.addPage();
          SBPDF(doc, account, property);
        }
      });
  
      window.open(URL.createObjectURL(doc.output("blob")));
    };
  
    function downloadTemplate(type: string) {
      let csvContent = '';
      if (type === 'combined') {
        csvContent = `Unit Number,Resident Name,Balance
  101,John Doe,100
  102,Jane Smith,200
  103,Bob Brown,300
  104,Alice Johnson,400
  105,Tom White,500
  106,Emily Davis,600
  107,Michael Green,700
  108,Susan Black,800
  109,Chris Blue,900
  110,Laura Orange,1000
  111,Kevin Purple,1100
  112,Nancy Gold,1200
  113,Mark Red,1300
  114,Lucy Blue,1400
  115,David Black,1500`;
      }
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'TemplateCombined.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  
    const handleCSVUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files ? target.files[0] : null;
      if (file) {
        Papa.parse(file, {
          header: true,
          complete: (results: Papa.ParseResult<any>) => {
            fakeDB = results.data.map(row => ({
              unitNumber: row["Unit Number"],
              name: row["Resident Name"],
              balance: parseFloat(row["Balance"])
            }));
          },
          error: (error: any) => {
            console.error("Error parsing CSV:", error);
          }
        });
      }
    };
  
    $: console.log(selectedPropertyId);
  </script>
  
  <div class="container">
    <h3>Letter Generator</h3>
    
    <label for="property">Select a Property:</label>
    <select name="property" bind:value={selectedPropertyId}>
      {#each propertyInfo as p}
        <option value={p.id}>{p.propertyName} ({p.id})</option>
      {/each}
    </select>
    
    <label for="csvUpload">Upload CSV:</label>
    <input type="file" id="csvUpload" accept=".csv" on:change={handleCSVUpload} />
    
    <label for="balanceThreshold">Balance Threshold:</label>
    <input type="number" id="balanceThreshold" bind:value={balanceThreshold} />
    
    <button class="download-button" on:click={() => downloadTemplate('combined')}>Download Template</button>
    <button class="download-button" on:click={generateLetters}>Generate PDF</button>
  </div>
  
  <style>
    .container {
      background-color: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      border-radius: 12px;
      padding: 20px;
      max-width: 500px;
      margin: 2rem auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 10px #ff3366;
      color: #ffffff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    h3 {
      color: #ff3366;
      margin-bottom: 1rem;
      text-shadow: 0 0 10px #ff3366;
    }
    label {
      display: block;
      margin: 0.5rem 0 0.3rem;
      color: #cccccc;
    }
    select,
    input[type="number"],
    input[type="file"] {
      width: 100%;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: rgba(0, 0, 0, 0.4);
      color: #fff;
      margin-bottom: 1rem;
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    select:focus,
    input[type="number"]:focus,
    input[type="file"]:focus {
      outline: none;
      border-color: #ff3366;
      box-shadow: 0 0 8px rgba(255, 51, 102, 0.7);
    }
    .download-button {
      display: inline-block;
      margin-top: 1rem;
      padding: 10px 15px;
      background: linear-gradient(45deg, #ff3366, #aa0044);
      color: #fff;
      text-decoration: none;
      text-align: center;
      border-radius: 6px;
      box-shadow: 0 0 10px rgba(255, 51, 102, 0.7);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .download-button:hover {
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(255, 51, 102, 1);
    }
    label {
      display: block;
      margin-top: 1rem;
      margin-bottom: 0.3rem;
      color: #ccc;
    }
  </style>
  