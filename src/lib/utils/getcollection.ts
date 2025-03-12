async function adddocument() {
    try {
        const docRef = await addDoc(collection(db, "clients"), newClient);
        clients.push({ id: docRef.id, ...newClient });
        newClient.name = "";
    } catch (error) {
        errorMessage = "Failed to add client.";
    }
}

async function loadcollection() {
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