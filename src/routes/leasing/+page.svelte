<script lang="ts">
    import { db, storage } from "$lib/firebase";
    import { collection, addDoc } from "firebase/firestore";
    import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
  
    let newLease = { propertyId: "", tenantId: "", startDate: "", endDate: "", rent: 0 };
    let leaseFile: File | null = null;
    let message = "";
  
    async function addLease() {
      try {
        let fileUrl = "";
        if (leaseFile) {
          // Upload file to Firebase Storage (path: leases/<filename>)
          const storageRef = ref(storage, `leases/${leaseFile.name}`);
          await uploadBytes(storageRef, leaseFile);
          fileUrl = await getDownloadURL(storageRef);
        }
        // Add lease record to Firestore
        await addDoc(collection(db, "leases"), {
          propertyId: newLease.propertyId,
          tenantId: newLease.tenantId,
          startDate: newLease.startDate,
          endDate: newLease.endDate,
          rent: newLease.rent,
          fileUrl
        });
        message = "Lease added successfully!";
        newLease = { propertyId: "", tenantId: "", startDate: "", endDate: "", rent: 0 };
        leaseFile = null;
      } catch (e) {
        console.error("Error adding lease", e);
        message = "Failed to add lease: " + e;
      }
    }
  </script>
  
  <h2 class="text-xl font-bold mb-4">Leasing</h2>
  <form on:submit|preventDefault={addLease} class="space-y-2 mb-4">
    <div>
      <input bind:value={newLease.propertyId} placeholder="Property ID" required class="border px-2 py-1 rounded mr-2"/>
      <input bind:value={newLease.tenantId} placeholder="Tenant UID" required class="border px-2 py-1 rounded"/>
    </div>
    <div>
      <input type="date" bind:value={newLease.startDate} required class="border px-2 py-1 rounded mr-2"/>
      <input type="date" bind:value={newLease.endDate} required class="border px-2 py-1 rounded"/>
    </div>
    <div>
      <input type="number" bind:value={newLease.rent} placeholder="Rent Amount" required class="border px-2 py-1 rounded"/>
    </div>
    <div>
      <input type="file" accept=".pdf,.png,.jpg" on:change={(e)=> { const target = e.target as HTMLInputElement; if (target.files) leaseFile = target.files[0]; }} 
             class="border px-2 py-1"/>
    </div>
    <button type="submit" class="bg-green-600 text-white px-3 py-1 rounded">Create Lease</button>
  </form>
  {#if message}<p>{message}</p>{/if}
  