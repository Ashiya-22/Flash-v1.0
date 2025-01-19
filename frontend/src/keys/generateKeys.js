export async function generateECDHKeys() {
    // Generate ECDH key pair
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-256", // 'P-256' is equivalent to 'secp256k1' for WebCrypto
        },
        true, // Keys are extractable
        ["deriveKey", "deriveBits"]
    );

    // Export the private key to a base64-encoded string
    const privateKeyArrayBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    const privateKey = btoa(String.fromCharCode(...new Uint8Array(privateKeyArrayBuffer)));

    // Export the public key to a base64-encoded string
    const publicKeyArrayBuffer = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const publicKey = btoa(String.fromCharCode(...new Uint8Array(publicKeyArrayBuffer)));

    return { privateKey, publicKey };
}