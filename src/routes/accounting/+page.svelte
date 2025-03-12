<script lang="ts">
    import { db } from "$lib/firebase";
    import { collection, addDoc, getDocs } from "firebase/firestore";
  
    // Data structures
    let newPayment = { leaseId: "", tenantId: "", amount: 0, date: "" };
    let newExpense = { propertyId: "", description: "", amount: 0, date: "" };
    let reportMessage = "";
  
    async function addPayment() {
      await addDoc(collection(db, "payments"), newPayment);
      newPayment = { leaseId: "", tenantId: "", amount: 0, date: "" };
    }
    async function addExpense() {
      await addDoc(collection(db, "expenses"), newExpense);
      newExpense = { propertyId: "", description: "", amount: 0, date: "" };
    }
  
    // Generate a simple financial report (total income vs expenses)
    async function generateReport() {
      const paymentsSnap = await getDocs(collection(db, "payments"));
      const expensesSnap = await getDocs(collection(db, "expenses"));
      let totalIncome = 0, totalExpenses = 0;
      paymentsSnap.forEach(doc => { totalIncome += doc.data().amount || 0; });
      expensesSnap.forEach(doc => { totalExpenses += doc.data().amount || 0; });
      reportMessage = `Total Income: $${totalIncome}, Total Expenses: $${totalExpenses}, 
                       Net: $${totalIncome - totalExpenses}`;
    }
  </script>
  
  <h2 class="text-xl font-bold mb-4">Accounting</h2>
  <div class="flex gap-8">
    <!-- Record a rent payment -->
    <div>
      <h3 class="font-semibold mb-2">Add Rent Payment</h3>
      <form on:submit|preventDefault={addPayment} class="space-y-2">
        <input bind:value={newPayment.leaseId} placeholder="Lease ID" required class="border px-2 py-1 rounded block"/>
        <input bind:value={newPayment.tenantId} placeholder="Tenant UID" required class="border px-2 py-1 rounded block"/>
        <input type="number" bind:value={newPayment.amount} placeholder="Amount" required class="border px-2 py-1 rounded block"/>
        <input type="date" bind:value={newPayment.date} required class="border px-2 py-1 rounded block"/>
        <button type="submit" class="bg-blue-600 text-white px-3 py-1 rounded">Add Payment</button>
      </form>
    </div>
  
    <!-- Record an expense -->
    <div>
      <h3 class="font-semibold mb-2">Add Expense</h3>
      <form on:submit|preventDefault={addExpense} class="space-y-2">
        <input bind:value={newExpense.propertyId} placeholder="Property ID" required class="border px-2 py-1 rounded block"/>
        <input bind:value={newExpense.description} placeholder="Description" required class="border px-2 py-1 rounded block"/>
        <input type="number" bind:value={newExpense.amount} placeholder="Amount" required class="border px-2 py-1 rounded block"/>
        <input type="date" bind:value={newExpense.date} required class="border px-2 py-1 rounded block"/>
        <button type="submit" class="bg-blue-600 text-white px-3 py-1 rounded">Add Expense</button>
      </form>
    </div>
  </div>
  
  <!-- Generate Report -->
  <div class="mt-6">
    <button on:click={generateReport} class="bg-gray-700 text-white px-4 py-2 rounded">Generate Financial Report</button>
    {#if reportMessage}
      <p class="mt-2 bg-gray-100 p-2">{reportMessage}</p>
    {/if}
  </div>
  