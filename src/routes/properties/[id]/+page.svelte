<script lang="ts">
    import { db } from "$lib/firebase";
    import { page } from "$app/stores";
    import { collection, query, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore";
    import { onMount } from "svelte";
  
    let propertyId = $page.params.id;
    let propertyName = "";  // could fetch property details if needed
    let units: { id: string; number: string; type: string }[] = [];
    let newUnit = { number: "", type: "" };
  
    // Fetch units for this property
    onMount(async () => {
      const unitsRef = collection(db, "properties", propertyId, "units");
      const snapshot = await getDocs(unitsRef);
      units = snapshot.docs.map(doc => {
        const data = doc.data() as { number: string; type: string };
        return { id: doc.id, ...data };
      });
      // Optionally fetch property data itself:
      // const propDoc = await getDoc(doc(db, "properties", propertyId));
      // propertyName = propDoc.data()?.name;
    });
  
    // Add a new unit in this property
    async function addUnit() {
      if (!newUnit.number) return;
      const unitsRef = collection(db, "properties", propertyId, "units");
      await addDoc(unitsRef, newUnit);
      const newUnitRef = await addDoc(unitsRef, newUnit);
      units.push({ id: newUnitRef.id, ...newUnit });
      newUnit = { number: "", type: "" };
    }
  
    // Delete a unit
    async function removeUnit(unitId: string) {
      await deleteDoc(doc(db, "properties", propertyId, "units", unitId));
      units = units.filter(u => u.id !== unitId);
    }
  </script>
  
  <h2 class="text-xl font-bold mb-2">Property {propertyName} (ID: {propertyId})</h2>
  <div class="mb-4">
    <form on:submit|preventDefault={addUnit} class="flex gap-2">
      <input bind:value={newUnit.number} placeholder="Unit Number" required class="border px-2 py-1 rounded"/>
      <input bind:value={newUnit.type} placeholder="Type (e.g. 1B1B)" class="border px-2 py-1 rounded"/>
      <button type="submit" class="bg-green-600 text-white px-3 py-1 rounded">Add Unit</button>
    </form>
  </div>
  <ul>
    {#each units as unit}
      <li class="mb-1">
        <span class="font-medium">Unit {unit.number}</span> – {unit.type}
        <button on:click={() => removeUnit(unit.id)} class="text-red-600 text-sm ml-2">[Delete]</button>
      </li>
    {/each}
  </ul>
  