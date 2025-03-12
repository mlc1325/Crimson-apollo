<script lang="ts">
    import { db } from "$lib/firebase";
    import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
    import { onMount } from "svelte";
  
    let workorders: Array<{ id: string, propertyId: string, tenantId: string, description: string, status: string }> = [];
    let newOrder = { propertyId: "", tenantId: "", description: "", status: "submitted" };
  
    // Load all work orders (in a real app, filter by role: tenant gets their orders, manager gets relevant ones)
    onMount(async () => {
      const snapshot = await getDocs(collection(db, "workorders"));
      workorders = snapshot.docs.map(doc => {
        const data = doc.data() as { propertyId: string, tenantId: string, description: string, status: string };
        return { id: doc.id, ...data };
      });
    });
  
    // Tenant (or manager) submits a new work order
    async function submitOrder() {
      await addDoc(collection(db, "workorders"), { ...newOrder, status: "submitted" });
      const newDocRef = await addDoc(collection(db, "workorders"), { ...newOrder, status: "submitted" });
      workorders.push({ id: newDocRef.id, ...newOrder, status: "submitted" });
      newOrder.description = "";
    }
  
    // Manager updates status of a work order
    async function updateStatus(id: string, newStatus: string) {
      await updateDoc(doc(db, "workorders", id), { status: newStatus });
      const wo = workorders.find(w => w.id === id);
      if (wo) wo.status = newStatus;
    }
  </script>



<div class="tabs tabs-box">
  <input type="radio" name="my_tabs_1" class="tab" aria-label="Dashboard" />
  <input type="radio" name="my_tabs_1" class="tab" aria-label="Unit Turns" />
  <input type="radio" name="my_tabs_1" class="tab" aria-label="Work Orders" />
  <input type="radio" name="my_tabs_1" class="tab" aria-label="Tools" />
</div>

  
  <!-- Form to submit a new work order -->
  <div>
    <h3>New Work Order</h3>
    <form on:submit|preventDefault={submitOrder}>
      <input bind:value={newOrder.propertyId} placeholder="Property ID" />
      <input bind:value={newOrder.tenantId} placeholder="Tenant UID" />
      <textarea bind:value={newOrder.description} placeholder="Issue description"></textarea>
      <button type="submit">Submit Request</button>
    </form>
  </div>
  
 