<script lang="ts">
	import Papa from 'papaparse';

	// Define the expected data type for each record.
	type LeaseData = {
		unitNumber: string;
		tenantName: string;
		leaseStart: string;
		leaseEnd: string;
		rentAmount: number;
		styleType: string;
	};

	let csvData: LeaseData[] = [];
	let flaggedUnits: { unit: string; tenant: string; issue: string }[] = [];
	let assumptions: string[] = [];

	// Configuration variables.
	let shortTermThreshold: number = 8;
	// Dynamic array for unit style baselines.
	let unitStylesConfig: { style: string; baseline: number }[] = [
		{ style: "2BR", baseline: 1300 },
		{ style: "Studio", baseline: 1100 },
		{ style: "3BR", baseline: 1600 }
	];
	let configVisible: boolean = false;

	// CSV Upload function.
	function handleCSVUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (!target || !target.files) return;
		const file = target.files[0];
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: (results) => {
				csvData = results.data as LeaseData[];
			}
		});
	}

	// Download template function for the combined CSV.
	function downloadTemplate(type: string) {
		let csvContent = '';
		if (type === 'combined') {
			csvContent = `unitNumber,tenantName,leaseStart,leaseEnd,rentAmount,styleType
101,John Doe,2023-01-01,2024-01-01,1300,2BR
102,Jane Smith,2023-03-01,2024-03-01,1150,Studio
103,Bob Brown,2023-02-15,2024-02-14,1400,2BR
104,Alice Johnson,2023-04-01,2024-04-01,1350,2BR
105,Tom White,2023-05-01,2024-05-01,1500,3BR
106,Emily Davis,2023-06-01,2024-06-01,1600,3BR
107,Michael Green,2023-07-01,2024-07-01,1250,2BR
108,Susan Black,2023-08-01,2024-08-01,1100,Studio
109,Chris Blue,2023-09-01,2023-11-01,1200,2BR
110,Laura Orange,2023-10-01,2024-10-01,1550,3BR
111,Kevin Purple,2023-11-01,2024-11-01,1200,2BR
112,Nancy Gold,2023-12-01,2024-06-01,900,Studio
113,Mark Red,2023-01-15,2024-01-15,1350,2BR
114,Lucy Blue,2023-02-01,2023-07-01,1100,Studio
115,David Black,2023-03-10,2024-03-10,1650,3BR`;
		}
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.setAttribute('download', `${type}-template.csv`);
		link.click();
	}

	// Load sample data directly for immediate testing.
	function loadSampleData() {
		const sampleCSV = `unitNumber,tenantName,leaseStart,leaseEnd,rentAmount,styleType
101,John Doe,2023-01-01,2024-01-01,1300,2BR
102,Jane Smith,2023-03-01,2024-03-01,1150,Studio
103,Bob Brown,2023-02-15,2024-02-14,1400,2BR
104,Alice Johnson,2023-04-01,2024-04-01,1350,2BR
105,Tom White,2023-05-01,2024-05-01,1500,3BR
106,Emily Davis,2023-06-01,2024-06-01,1600,3BR
107,Michael Green,2023-07-01,2024-07-01,1250,2BR
108,Susan Black,2023-08-01,2024-08-01,1100,Studio
109,Chris Blue,2023-09-01,2023-11-01,1200,2BR
110,Laura Orange,2023-10-01,2024-10-01,1550,3BR
111,Kevin Purple,2023-11-01,2024-11-01,1200,2BR
112,Nancy Gold,2023-12-01,2024-06-01,900,Studio
113,Mark Red,2023-01-15,2024-01-15,1350,2BR
114,Lucy Blue,2023-02-01,2023-07-01,1100,Studio
115,David Black,2023-03-10,2024-03-10,1650,3BR`;
		Papa.parse(sampleCSV, {
			header: true,
			skipEmptyLines: true,
			complete: (results) => {
				csvData = results.data as LeaseData[];
			}
		});
	}

	// Helper function to group data by a key.
	function groupBy<T>(array: T[], keyGetter: (item: T) => string): Record<string, T[]> {
		const map: Record<string, T[]> = {};
		array.forEach((item) => {
			const key = keyGetter(item);
			if (!map[key]) {
				map[key] = [];
			}
			map[key].push(item);
		});
		return map;
	}

	// Analysis function to flag discrepancies.
	function analyzeData() {
		flaggedUnits = [];
		assumptions = [];

		// Build a baseline map from the dynamic config.
		let baselineMap: Record<string, number> = {};
		unitStylesConfig.forEach(entry => {
			baselineMap[entry.style] = entry.baseline;
		});

		// Check each record individually.
		csvData.forEach(record => {
			let leaseStart: Date;
			let leaseEnd: Date;
			if (!record.leaseStart || !record.leaseEnd) {
				assumptions.push(`Missing lease dates for unit ${record.unitNumber}. Assuming a 12-month lease.`);
				leaseStart = new Date();
				leaseEnd = new Date(leaseStart);
				leaseEnd.setMonth(leaseEnd.getMonth() + 12);
			} else {
				leaseStart = new Date(record.leaseStart);
				leaseEnd = new Date(record.leaseEnd);
			}
			// Calculate lease duration in months.
			const leaseDuration = (leaseEnd.getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24 * 30);
			if (leaseDuration <= shortTermThreshold) {
				flaggedUnits.push({
					unit: record.unitNumber,
					tenant: record.tenantName,
					issue: `Short-term lease (${leaseDuration.toFixed(1)} months)`
				});
			}
			let baselineRent = baselineMap[record.styleType] || 1200;
			if (record.rentAmount < baselineRent) {
				flaggedUnits.push({
					unit: record.unitNumber,
					tenant: record.tenantName,
					issue: `Low rent amount (${record.rentAmount}) for ${record.styleType} (baseline ${baselineRent})`
				});
			}
		});

		// Additional analysis: Group by unit to check for stagnant rent increases.
		const groupedByUnit = groupBy(csvData, record => record.unitNumber);
		Object.entries(groupedByUnit).forEach(([unit, leases]) => {
			if (leases.length > 1) {
				leases.sort((a, b) => new Date(a.leaseStart).getTime() - new Date(b.leaseStart).getTime());
				for (let i = 1; i < leases.length; i++) {
					const prev = leases[i - 1];
					const curr = leases[i];
					// If the rent remains unchanged between successive leases, flag it.
					if (Math.abs(curr.rentAmount - prev.rentAmount) < 0.01) {
						flaggedUnits.push({
							unit: unit,
							tenant: curr.tenantName,
							issue: `No rent increase between leases starting ${prev.leaseStart} and ${curr.leaseStart}`
						});
					}
				}
			}
		});

		// Additional analysis: Check for tenants renting multiple units.
		const tenantMap = groupBy(csvData, record => record.tenantName.toLowerCase());
		Object.entries(tenantMap).forEach(([tenant, records]) => {
			const uniqueUnits = new Set(records.map(r => r.unitNumber));
			if (uniqueUnits.size > 1) {
				flaggedUnits.push({
					unit: Array.from(uniqueUnits).join(', '),
					tenant: tenant,
					issue: `Tenant appears in multiple units (${uniqueUnits.size} units)`
				});
			}
		});

		if (assumptions.length === 0) {
			assumptions.push("No assumptions were needed based on the provided data.");
		}
	}

	// Functions to manage dynamic unit style configuration.
	function addUnitStyle() {
		unitStylesConfig.push({ style: '', baseline: 0 });
	}

	function removeUnitStyle(index: number) {
		unitStylesConfig.splice(index, 1);
	}
</script>

<div class="page-container">
	<h1>Apartment Lease & Rent Analysis</h1>

	<!-- Collapsible Configuration Area -->
	<button on:click={() => configVisible = !configVisible}>
		{configVisible ? "Hide Configuration" : "Show Configuration"}
	</button>
	{#if configVisible}
		<div class="config-area">
			<h2>Configuration</h2>
			<div class="config-item">
				<label>Short-Term Lease Threshold (months):</label>
				<input type="number" bind:value={shortTermThreshold} min="1" />
			</div>
			<h3>Unit Style Baselines</h3>
			{#each unitStylesConfig as styleConfig, index}
				<div class="config-item">
					<label>Style:</label>
					<input type="text" bind:value={styleConfig.style} placeholder="e.g., 2BR" />
					<label>Baseline Rent:</label>
					<input type="number" bind:value={styleConfig.baseline} min="0" />
					<button on:click={() => removeUnitStyle(index)}>Remove</button>
				</div>
			{/each}
			<button on:click={addUnitStyle}>Add Unit Style</button>
		</div>
	{/if}

	<div>
		<label>Lease Data CSV</label>
		<input type="file" accept=".csv" on:change={handleCSVUpload} />
		<button on:click={() => downloadTemplate('combined')}>Download Combined Template</button>
		<button on:click={loadSampleData}>Load Sample Data</button>
	</div>

	<button on:click={analyzeData}>Run Analysis</button>

	{#if flaggedUnits.length > 0}
		<table>
			<thead>
				<tr>
					<th>Unit</th>
					<th>Tenant</th>
					<th>Issue</th>
				</tr>
			</thead>
			<tbody>
				{#each flaggedUnits as unit}
					<tr>
						<td>{unit.unit}</td>
						<td>{unit.tenant}</td>
						<td class="issue">{unit.issue}</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<h3>Assumptions Made:</h3>
		<ul>
			{#each assumptions as assumption}
				<li>{assumption}</li>
			{/each}
		</ul>
	{:else}
		<p>No flagged units found or analysis not yet run.</p>
	{/if}
</div>

<style>
	:root {
		--bg-color: #0d0d0d;
		--primary-color: #a3001b;
		--accent-color: #7a0013;
		--text-color: #fff;
		--border-color: #333;
		--card-bg: #1a1a1a;
		--table-header-bg: #222;
		--table-row-bg: #151515;
		--table-row-alt-bg: #1a1a1a;
		--font-family: 'Roboto', sans-serif;
	}

	* {
		box-sizing: border-box;
	}

	.page-container {
		background: var(--bg-color);
		color: var(--text-color);
		padding: 2rem;
		min-height: 100vh;
		font-family: var(--font-family);
	}

	h1 {
		color: var(--text-color);
		border-bottom: 2px solid var(--primary-color);
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
	}

	.config-area {
		background: var(--card-bg);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 1rem;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
	}

	.config-area h2,
	.config-area h3 {
		margin-top: 0;
	}

	.config-item {
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	input[type="file"],
	input[type="number"],
	input[type="text"] {
		margin-top: 0.5rem;
		padding: 0.75rem;
		border-radius: 6px;
		border: 1px solid var(--border-color);
		background: var(--card-bg);
		color: var(--text-color);
		font-size: 1rem;
	}

	button {
		margin-top: 0.5rem;
		padding: 0.75rem 1rem;
		border-radius: 6px;
		border: none;
		background-color: var(--primary-color);
		color: var(--text-color);
		cursor: pointer;
		font-size: 1rem;
		transition: background-color 0.2s ease;
	}

	button:hover {
		background-color: var(--accent-color);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1.5rem;
	}

	th,
	td {
		padding: 1rem;
		border-bottom: 1px solid var(--border-color);
		text-align: left;
	}

	th {
		background-color: var(--table-header-bg);
	}

	tr:nth-child(even) {
		background-color: var(--table-row-alt-bg);
	}

	tr:hover {
		background-color: var(--table-row-bg);
	}

	.issue {
		color: #ff5151;
		font-weight: bold;
	}
</style>
