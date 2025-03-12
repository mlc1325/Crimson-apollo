<script lang="ts">
    import { onMount } from "svelte";
    import { db } from "$lib/firebase";
    import { collection, getDocs, addDoc } from "firebase/firestore";

    let clients: { id: string, name: string }[] = [];
    let selectedClient = "";
    let properties: { id: string, name: string, clientId: string }[] = [];
    let selectedProperty = "";
    let units: { id: string, unitNumber: string, style: string, squareFootage: string, propertyId: string }[] = [];
    let selectedUnit = "";
    let errorMessage = "";
    
    let showClients = false;
    let showProperties = false;
    let showUnits = false;
    let showResidents = false;

    let newClient = { name: "" };
    let newProperty = { name: "", clientId: "" };
    let newUnit = { unitNumber: "", style: "", squareFootage: "", propertyId: "" };
    let newResident = { name: "", moveInDate: "", unitId: "" };

    async function loadClients() {
        try {
            const querySnapshot = await getDocs(collection(db, "clients"));
            clients = querySnapshot.docs.map(doc => {
                const data = doc.data() as { name: string };
                return { id: doc.id, ...data };
            });
        } catch (error) {
            errorMessage = "Failed to load clients.";
        }
    }

    async function loadProperties() {
        if (!selectedClient) return;
        try {
            const querySnapshot = await getDocs(collection(db, "properties"));
            properties = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(prop => prop.clientId === selectedClient);
        } catch (error) {
            errorMessage = "Failed to load properties.";
        }
    }

    async function loadUnits() {
        if (!selectedProperty) return;
        try {
            const querySnapshot = await getDocs(collection(db, "units"));
            units = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(unit => unit.propertyId === selectedProperty);
        } catch (error) {
            errorMessage = "Failed to load units.";
        }
    }

    async function addClient() {
        await addDoc(collection(db, "clients"), newClient);
        newClient = { name: "" };
        loadClients();
    }

    async function addProperty() {
        if (!selectedClient) return;
        newProperty.clientId = selectedClient;
        await addDoc(collection(db, "properties"), newProperty);
        newProperty = { name: "", clientId: "" };
        loadProperties();
    }

    async function addUnit() {
        if (!selectedProperty) return;
        newUnit.propertyId = selectedProperty;
        await addDoc(collection(db, "units"), newUnit);
        newUnit = { unitNumber: "", style: "", squareFootage: "", propertyId: "" };
        loadUnits();
    }

    async function addResident() {
        if (!selectedUnit) return;
        newResident.unitId = selectedUnit;
        await addDoc(collection(db, "residents"), newResident);
        newResident = { name: "", moveInDate: "", unitId: "" };
    }

    onMount(() => {
        loadClients();
    });
</script>

<div class="add-entry-container">
    <h2>Add New Entries</h2>

    <div class="collapsible">
        <button on:click={() => showClients = !showClients} class="toggle-btn">
            {showClients ? "▲ Hide" : "▼ Add Client"}
        </button>
        {#if showClients}
            <div class="form-group">
                <input type="text" bind:value={newClient.name} placeholder="Client Name" />
                <button on:click={addClient}>Add</button>
            </div>
        {/if}
    </div>

    <div class="collapsible">
        <button on:click={() => showProperties = !showProperties} class="toggle-btn">
            {showProperties ? "▲ Hide" : "▼ Add Property"}
        </button>
        {#if showProperties}
            <div class="form-group">
                <label>Select Client:</label>
                <select bind:value={selectedClient} on:change={loadProperties}>
                    <option value="" disabled>Select a client</option>
                    {#each clients as client}
                        <option value={client.id}>{client.name}</option>
                    {/each}
                </select>
                <input type="text" bind:value={newProperty.name} placeholder="Property Name" />
                <button on:click={addProperty} disabled={!selectedClient}>Add</button>
            </div>
        {/if}
    </div>

    <div class="collapsible">
        <button on:click={() => showUnits = !showUnits} class="toggle-btn">
            {showUnits ? "▲ Hide" : "▼ Add Unit"}
        </button>
        {#if showUnits}
            <div class="form-group">
                <label>Select Property:</label>
                <select bind:value={selectedProperty} on:change={loadUnits}>
                    <option value="" disabled>Select a property</option>
                    {#each properties as property}
                        <option value={property.id}>{property.name}</option>
                    {/each}
                </select>
                <input type="text" bind:value={newUnit.unitNumber} placeholder="Unit Number" />
                <input type="text" bind:value={newUnit.style} placeholder="Style" />
                <input type="number" bind:value={newUnit.squareFootage} placeholder="Square Footage" />
                <button on:click={addUnit} disabled={!selectedProperty}>Add</button>
            </div>
        {/if}
    </div>

    <div class="collapsible">
        <button on:click={() => showResidents = !showResidents} class="toggle-btn">
            {showResidents ? "▲ Hide" : "▼ Add Resident"}
        </button>
        {#if showResidents}
            <div class="form-group">
                <label>Select Unit:</label>
                <select bind:value={selectedUnit}>
                    <option value="" disabled>Select a unit</option>
                    {#each units as unit}
                        <option value={unit.id}>{unit.unitNumber} - {unit.style}</option>
                    {/each}
                </select>
                <input type="text" bind:value={newResident.name} placeholder="Resident Name" />
                <input type="date" bind:value={newResident.moveInDate} />
                <button on:click={addResident} disabled={!selectedUnit}>Add</button>
            </div>
        {/if}
    </div>
</div>

