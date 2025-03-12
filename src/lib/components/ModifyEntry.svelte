<script>
    import { onMount } from "svelte";
    import { db } from "$lib/firebase";
    import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

    let clients = [];
    let selectedClient = "";
    let properties = [];
    let selectedProperty = "";
    let units = [];
    let selectedUnit = "";
    let residents = [];

    let showClients = false;
    let showProperties = false;
    let showUnits = false;
    let showResidents = false;

    let errorMessage = "";

    async function loadClients() {
        try {
            const querySnapshot = await getDocs(collection(db, "clients"));
            clients = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

    async function loadResidents() {
        if (!selectedUnit) return;
        try {
            const querySnapshot = await getDocs(collection(db, "residents"));
            residents = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(resident => resident.unitId === selectedUnit);
        } catch (error) {
            errorMessage = "Failed to load residents.";
        }
    }

    async function updateEntry(collectionName, id, updatedData) {
        await updateDoc(doc(db, collectionName, id), updatedData);
    }

    async function deleteEntry(collectionName, id) {
        await deleteDoc(doc(db, collectionName, id));
        if (collectionName === "clients") loadClients();
        if (collectionName === "properties") loadProperties();
        if (collectionName === "units") loadUnits();
        if (collectionName === "residents") loadResidents();
    }

    onMount(() => {
        loadClients();
    });
</script>

<div class="add-entry-container">
    <h2>Modify Entries</h2>

    <div class="collapsible">
        <button on:click={() => showClients = !showClients} class="toggle-btn">
            {showClients ? "▲ Hide Clients" : "▼ Modify Clients"}
        </button>
        {#if showClients}
            <div class="form-group">
                {#each clients as client}
                    <div class="entry-item">
                        <input type="text" bind:value={client.name} on:change={() => updateEntry("clients", client.id, { name: client.name })} />
                        <button class="delete-btn" on:click={() => deleteEntry("clients", client.id)}>✖</button>
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <div class="collapsible">
        <button on:click={() => showProperties = !showProperties} class="toggle-btn">
            {showProperties ? "▲ Hide Properties" : "▼ Modify Properties"}
        </button>
        {#if showProperties}
            <label>Select Client:</label>
            <select bind:value={selectedClient} on:change={loadProperties}>
                <option value="" disabled>Select a client</option>
                {#each clients as client}
                    <option value={client.id}>{client.name}</option>
                {/each}
            </select>
            <div class="form-group">
                {#each properties as property}
                    <div class="entry-item">
                        <input type="text" bind:value={property.name} on:change={() => updateEntry("properties", property.id, { name: property.name })} />
                        <button class="delete-btn" on:click={() => deleteEntry("properties", property.id)}>✖</button>
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <div class="collapsible">
        <button on:click={() => showUnits = !showUnits} class="toggle-btn">
            {showUnits ? "▲ Hide Units" : "▼ Modify Units"}
        </button>
        {#if showUnits}
            <label>Select Property:</label>
            <select bind:value={selectedProperty} on:change={loadUnits}>
                <option value="" disabled>Select a property</option>
                {#each properties as property}
                    <option value={property.id}>{property.name}</option>
                {/each}
            </select>
            <div class="form-group">
                {#each units as unit}
                    <div class="entry-item">
                        <input type="text" bind:value={unit.unitNumber} on:change={() => updateEntry("units", unit.id, { unitNumber: unit.unitNumber })} />
                        <input type="text" bind:value={unit.style} on:change={() => updateEntry("units", unit.id, { style: unit.style })} />
                        <input type="number" bind:value={unit.squareFootage} on:change={() => updateEntry("units", unit.id, { squareFootage: unit.squareFootage })} />
                        <button class="delete-btn" on:click={() => deleteEntry("units", unit.id)}>✖</button>
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <div class="collapsible">
        <button on:click={() => showResidents = !showResidents} class="toggle-btn">
            {showResidents ? "▲ Hide Residents" : "▼ Modify Residents"}
        </button>
        {#if showResidents}
            <label>Select Unit:</label>
            <select bind:value={selectedUnit} on:change={loadResidents}>
                <option value="" disabled>Select a unit</option>
                {#each units as unit}
                    <option value={unit.id}>{unit.unitNumber} - {unit.style}</option>
                {/each}
            </select>
            <div class="form-group">
                {#each residents as resident}
                    <div class="entry-item">
                        <input type="text" bind:value={resident.name} on:change={() => updateEntry("residents", resident.id, { name: resident.name })} />
                        <input type="date" bind:value={resident.moveInDate} on:change={() => updateEntry("residents", resident.id, { moveInDate: resident.moveInDate })} />
                        <button class="delete-btn" on:click={() => deleteEntry("residents", resident.id)}>✖</button>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>