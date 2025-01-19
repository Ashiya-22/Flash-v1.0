// Function to open the IndexedDB
function openDB(dbName = 'KeyValueDB', version = 1) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, version);

        // Triggered if the database does not exist or needs an upgrade
        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create the object store if it doesn't already exist
            if (!db.objectStoreNames.contains('store')) {
                db.createObjectStore('store', { keyPath: 'key' });
            }
        };

        // Successfully opened or created the database
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        // Handle errors during the database open operation
        request.onerror = (event) => {
            reject(`Database error: ${event.target.errorCode}`);
        };
    });
}

// Function to store a key-value pair
function storeKeyValue(key, value) {
    openDB().then((db) => {
        const transaction = db.transaction('store', 'readwrite');
        const objectStore = transaction.objectStore('store');

        const data = { key, value }; // Key-value pair to store

        objectStore.put(data); // Store the key-value pair

        transaction.oncomplete = () => {
            console.log('Key-value pair stored successfully!');
        };

        transaction.onerror = (event) => {
            console.error('Error storing the key-value pair:', event.target.error);
        };
    }).catch((error) => {
        console.error('Error opening database:', error);
    });
}

// Function to retrieve a value by key
function getValueByKey(key) {
    openDB().then((db) => {
        const transaction = db.transaction('store', 'readonly');
        const objectStore = transaction.objectStore('store');

        const request = objectStore.get(key);

        request.onsuccess = (event) => {
            const result = event.target.result;
            if (result) {
                sessionStorage.setItem(key, result.value); // Store the value in session storage
            } else {
                sessionStorage.setItem(key, null); // Store null if no value is found
            }
        };

        request.onerror = (event) => {
            console.error(`Error retrieving the value: ${event.target.error}`);
        };
    }).catch((error) => {
        console.error(`Error opening database: ${error}`);
    });
}

// Export functions
export { storeKeyValue, getValueByKey };
