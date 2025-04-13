<script>
    import AddEntry from "$lib/components/AddEntry.svelte";
    import ModifyEntry from "$lib/components/ModifyEntry.svelte";
    import { db } from "$lib/firebase";
    import { collection, getDocs, addDoc } from "firebase/firestore";

    let activeTab = AddEntry;
    const tabs = [
  { collectionName: "clients", label: "Clients" },
  { collectionName: "Properties", label: "Properties" },
  { collectionName: "units", label: "Units" },
];

   
</script>


    <div class="tabs">
        {#each tabs as tab}
            <button on:click={() => activeTab = tab.component}>{tab.label}</button>
        {/each}
    
        
        
        {#if activeTab}
            <svelte:component this={activeTab} />
        {/if}
        
        
    </div>



