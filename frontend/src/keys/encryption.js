export async function encryptMessage(payload, privateKeyBase64, publicKeyBase64) {
    // Import the private key
    const privateKey = await crypto.subtle.importKey(
        "pkcs8",
        Uint8Array.from(atob(privateKeyBase64), c => c.charCodeAt(0)),
        { name: "ECDH", namedCurve: "P-256" },
        false,
        ["deriveBits"]
    );

    // Import the public key
    const publicKey = await crypto.subtle.importKey(
        "spki",
        Uint8Array.from(atob(publicKeyBase64), c => c.charCodeAt(0)),
        { name: "ECDH", namedCurve: "P-256" },
        false,
        []
    );

    // Derive the shared secret
    const sharedSecret = await crypto.subtle.deriveBits(
        { name: "ECDH", public: publicKey },
        privateKey,
        256
    );

    // Hash the shared secret to derive the AES key
    const keyMaterial = await crypto.subtle.digest("SHA-256", sharedSecret);
    const key = await crypto.subtle.importKey(
        "raw",
        keyMaterial,
        { name: "AES-GCM" },
        false,
        ["encrypt"]
    );

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the payload
    const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        new TextEncoder().encode(payload)
    );

    // Combine IV and encrypted data
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, "0")).join("");
    const encryptedHex = Array.from(new Uint8Array(encryptedData)).map(b => b.toString(16).padStart(2, "0")).join("");

    return {
        encryptedMessage: btoa(ivHex + encryptedHex),
    };
}


export async function decryptMessage(payload, privateKeyBase64, publicKeyBase64) {
    
    const decryptedPayload = await Promise.all(
        payload.map(async (data) => {
            if (data.text) {
                const decryptedText = await decryptHelper(data.text, privateKeyBase64, publicKeyBase64);
                return { ...data, text: decryptedText.decrypted, qC: decryptedText.check };
            } else if (data.image) {
                return { ...data, qC: true };
            }
            return data; // Return the unchanged object if no text or image field exists
        })
    );

    return decryptedPayload; // Returns an array of objects
}

export async function decryptHelper(data, privateKeyBase64, publicKeyBase64) {
    try {
        // Import private key
        const privateKey = await crypto.subtle.importKey(
            "pkcs8",
            Uint8Array.from(atob(privateKeyBase64), (c) => c.charCodeAt(0)),
            { name: "ECDH", namedCurve: "P-256" },
            false,
            ["deriveBits"]
        );

        // Import public key
        const publicKey = await crypto.subtle.importKey(
            "spki",
            Uint8Array.from(atob(publicKeyBase64), (c) => c.charCodeAt(0)),
            { name: "ECDH", namedCurve: "P-256" },
            false,
            []
        );

        // Derive the shared secret
        const sharedSecret = await crypto.subtle.deriveBits(
            { name: "ECDH", public: publicKey },
            privateKey,
            256
        );

        // Hash the shared secret to derive the AES key
        const keyMaterial = await crypto.subtle.digest("SHA-256", sharedSecret);
        const key = await crypto.subtle.importKey(
            "raw",
            keyMaterial,
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );

        // Decode data and split IV and encrypted data
        const hexData = atob(data);
        const ivHex = hexData.slice(0, 24);
        const encryptedHex = hexData.slice(24);

        const iv = new Uint8Array(ivHex.match(/.{2}/g).map((byte) => parseInt(byte, 16)));
        const encryptedData = new Uint8Array(encryptedHex.match(/.{2}/g).map((byte) => parseInt(byte, 16)));

        // Decrypt
        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            encryptedData
        );

        return {
            decrypted: new TextDecoder().decode(decryptedBuffer),
            check: true,
        };
    } catch (error) {
        return {
            decrypted: "Breached Message",
            check: false,
        };
    }
}
