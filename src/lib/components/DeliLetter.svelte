<script>
    import { jsPDF } from 'jspdf';
    import Papa from 'papaparse'; // Install PapaParse with npm or use a CDN

    const templatePath = "public\Templatezzz.csv";

    let fakeDB = []; // This will be updated with the CSV data
    let balanceThreshold = 0;
    
    

    
    const propertyInfo = [
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
    
    let selectedPropertyId = propertyInfo[0].id; // Default selected property ID
    
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
        bottom: 1 * paper.ppi
    };

    let paperCenter = paper.width / 2;

    const textConfig = { maxWidth: paper.width - (margin.left + margin.right) };

    function NTQPDF(doc, account, property) {
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

        y += doc.getLineHeight();
        y += doc.getLineHeight();
        y += doc.getLineHeight();

        doc.setFontSize(fontSizes.h3);
        doc.setFont("times");

        const title = "Notice to Vacate for Nonpayment";
        doc.text(title, paperCenter, y, { ...textConfig, align: "center" });

        y += doc.getLineHeight();
        doc.setFontSize(fontSizes.pp);

        doc.text("Dear Resident,", margin.left, y, textConfig);
        y += doc.getLineHeight();

        const nonComplianceText = "          You are hereby notified that you are not complying with your lease in that you are late on your rent for the payment(s)" 
        +`of ${formattedBalance} due on ${today.getMonth() + 1}/1/${today.getFullYear()}`;
        doc.text(nonComplianceText, margin.left, y, textConfig);
        // doc.text(`          You are hereby notified that you are not complying with your lease in that you are late on your rent for the payment(s) of ${formattedBalance} due on ${new Date().getMonth()}/1/${new Date().getFullYear()}`, margin.left, y, textConfig);
        y += doc.getLineHeight();
        y += doc.getLineHeight();
        y += doc.getLineHeight();

        doc.text("You have 10 days ending on " + new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US') + " to make payment in full to the following:", margin.left, y, textConfig);
        y += doc.getLineHeight();
        y += doc.getLineHeight();

        doc.text("Payable to: " + property.propertyName, margin.left*2, y, textConfig);
        y += doc.getLineHeight();
        doc.text("Address: " + property.mailingAddress, margin.left*2, y, textConfig);
        y += doc.getLineHeight();
        y += doc.getLineHeight();
        y += doc.getLineHeight();

        doc.setFontSize(fontSizes.h3, "bold");
        doc.text("Or vacate the premises", paperCenter, y, null, null, "center");
        y += doc.getLineHeight();
        y += doc.getLineHeight();
      
        
        doc.setFontSize(fontSizes.pp, "bold");
        doc.text("Please note that late fees are assessed on the 6th and the 10th of each month.", margin.left, y);
        y += doc.getLineHeight();
        doc.text("- on the 6th your balance will be: $" + parseFloat(account.balance + 50).toFixed(2), margin.left*1.5, y);
        y += doc.getLineHeight();
        doc.text("- on the 10th your balance will be: $" + parseFloat(account.balance + 125).toFixed(2), margin.left*1.5, y);
        y += doc.getLineHeight();
        y += doc.getLineHeight();
        y += doc.getLineHeight();
        y += doc.getLineHeight();

        doc.setFontSize(fontSizes.pp, "normal");
             
    }

    function SBPDF(doc, account, property) {
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

        y += doc.getLineHeight();
        y += doc.getLineHeight();
        y += doc.getLineHeight();

        doc.setFontSize(fontSizes.h3);
        doc.setFont("times");

        const title = "Notice of current balance";
        doc.text(title, paperCenter, y, { ...textConfig, align: "center" });

        y += doc.getLineHeight();
        doc.setFontSize(fontSizes.pp);

        doc.text("Dear Resident,", margin.left, y, textConfig);
        y += doc.getLineHeight();

        const nonComplianceText = "          You are hereby notified that you currently have a balance"+` of ${formattedBalance}. Please resolve this promptly to avoid late fees and any other possible actions or remedys. Please note that we only accept payment in full. Any future rent will not be accepted until this is fulfilled.`;

        doc.text(nonComplianceText, margin.left, y, textConfig);
        // doc.text(`          You are hereby notified that you are not complying with your lease in that you are late on your rent for the payment(s) of ${formattedBalance} due on ${new Date().getMonth()}/1/${new Date().getFullYear()}`, margin.left, y, textConfig);
        y += doc.getLineHeight();
        y += doc.getLineHeight();
        y += doc.getLineHeight();

        //doc.text("You have 10 days ending on " + new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US') + " to make payment in full to the following:", margin.left, y, textConfig);
        //y += doc.getLineHeight();
        y += doc.getLineHeight();

        doc.text("Payable to: " + property.propertyName, margin.left*2, y, textConfig);
        y += doc.getLineHeight();
        doc.text("Address: " + property.mailingAddress, margin.left*2, y, textConfig);
        y += doc.getLineHeight();
        y += doc.getLineHeight();
        y += doc.getLineHeight();

        doc.setFontSize(fontSizes.h3, "bold");
        //doc.text("Or vacate the premises", paperCenter, y, null, null, "center");
        //y += doc.getLineHeight();
        //y += doc.getLineHeight();
      
        
        doc.setFontSize(fontSizes.pp, "bold");
        doc.text("Please note that late fees are assessed on the 6th ($50.00) and the 10th ($75.00) of each month.", margin.left, y);
        y += doc.getLineHeight();
        doc.text("- on the 6th your balance will be: $" + parseFloat(account.balance + 50).toFixed(2), margin.left*1.5, y);
        y += doc.getLineHeight();
        doc.text("- on the 10th your balance will be: $" + parseFloat(account.balance + 125).toFixed(2), margin.left*1.5, y);
        y += doc.getLineHeight();
        y += doc.getLineHeight();
        y += doc.getLineHeight();
        y += doc.getLineHeight();

        doc.setFontSize(fontSizes.pp, "normal");
             
    }
    
    const generateLetters = () => {
        const property = propertyInfo.find(p => p.id === selectedPropertyId); // Get selected property's details
        const doc = new jsPDF(paper.orientation, paper.unit, paper.size, true);

        doc.text("Distribution", paperCenter, 200, { align: "center" });

        fakeDB.forEach(account => {
            // Check the balance before generating the letter
            if (account.balance > balanceThreshold) {
                doc.addPage();
                NTQPDF(doc, account, property);
            } else {
                doc.addPage();
                SBPDF(doc, account, property);
            }
        });

        doc.addPage();

        doc.text("Office Copy", paperCenter, 200, { align: "center" });
        fakeDB.forEach(account => {
            // Check the balance before generating the letter
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

    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    fakeDB = results.data.map(row => ({
                        unitNumber: row["Unit Number"],
                        name: row["Resident Name"],
                        balance: parseFloat(row["Balance"])
                    }));
                },
                error: (error) => {
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
    <input type="number" id="balanceThreshold" bind:value={balanceThreshold}/>

    <a href={templatePath} class="download-button">Download Template</a>

    <button on:click={generateLetters}>Generate PDF</button>
</div>