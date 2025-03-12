<script lang="ts">
    import { db } from "$lib/firebase";
    import { collection, getDocs, addDoc } from "firebase/firestore";
    import { onMount } from "svelte";
  
    let properties: { id: string; name: string; address: string }[] = [];
    let newProperty = { name: "", address: "" };
    let error = "";
  
    // Fetch properties on component mount
    onMount(async () => {
      try {
        const snapshot = await getDocs(collection(db, "properties"));
        properties = snapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, name: data.name, address: data.address };
        });
      } catch (e) {
        console.error("Failed to load properties", e);
      }
    });
  
    // Add a new property to Firestore
    async function addProperty() {
      try {
        await addDoc(collection(db, "properties"), newProperty);
        properties.push({ id: Date.now().toString(), ...newProperty });  // update local list (for demo; ideally re-fetch or use snapshot listener)
        newProperty = { name: "", address: "" };  // reset form
      } catch (e) {
        error = "Error adding property: " + (e as Error).message;
      }
    }
  </script>
  
  <h2 class="text-xl font-bold mb-4">Properties</h2>
  <div class="mb-4">
    <form on:submit|preventDefault={addProperty} class="flex gap-2">
      <input bind:value={newProperty.name} placeholder="Property Name" required
             class="px-2 py-1 border rounded" />
      <input bind:value={newProperty.address} placeholder="Address" required
             class="px-2 py-1 border rounded" />
      <button type="submit" class="bg-green-600 text-white px-3 py-1 rounded">Add Property</button>
    </form>
    {#if error}<p class="text-red-500 text-sm">{error}</p>{/if}
  </div>
  <ul>
    {#each properties as prop}
      <li class="p-2 border-b">
        <a href="/properties/{prop.id}" class="text-blue-600 hover:underline">{prop.name}</a>
        <span class="text-gray-600 text-sm"> – {prop.address}</span>
      </li>
    {/each}
  </ul>
  