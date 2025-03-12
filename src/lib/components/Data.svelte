<script lang="ts">
import { collection, getDocs, addDoc, getFirestore } from "firebase/firestore";
import {db} from "$lib/firebase";

let clients = [];
let properties: { id: string, clientId: string }[] = [];
let units = [];
let residents: { id: string, name: string }[] = [];
let selectedClient: string | null = null;
let selectedProperty: string | null = null;
let newClient = { name: "" };
let newProperty = { name: "" };
let newUnit = { unitNumber: "", style: "", squareFootage: "" };
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


</script>

