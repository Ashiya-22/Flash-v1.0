import jwt from "jsonwebtoken";
import os from "os";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const generateToken= (userId,res)=>{
    const token=jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"7d"
    })

    res.cookie("jwt",token,{
        maxAge: 7*60*60*24*1000, //ms
        httpOnly: true, //prevent XSS attacks
        sameSite: "strict",
        secure: process.env.NODE_ENV!=="development"
    })

    return token;
};

export function savePrivateKey(privateKey,keyName){
    const userDir = os.homedir();
    const flashFolderPath = `${userDir}${process.env.FLASH_PATH}`;
    const privateKeyFilePath = path.join(flashFolderPath, `${keyName}.key`);

    if (!fs.existsSync(flashFolderPath)) {
        fs.mkdirSync(flashFolderPath, { recursive: true });
        // console.log('Flash folder created at:', flashFolderPath);
    }

    fs.writeFileSync(privateKeyFilePath, privateKey);
    // console.log(`Private key saved at: ${privateKeyFilePath}`);
}

export function retrievePrivateKey(keyName){
    const userDir = os.homedir();
    const flashFolderPath = `${userDir}${process.env.FLASH_PATH}`;
    const privateKeyFilePath = path.join(flashFolderPath, `${keyName}.key`);

    let privateKey;
    if (fs.existsSync(privateKeyFilePath)) {
        privateKey = fs.readFileSync(privateKeyFilePath, 'utf8');
        // console.log('Loaded existing private key.');
    }
    return {privateKey};
}

export function encryptMessage(payLoad,privateKey,publicKey){
    const ecdh = crypto.createECDH('secp256k1');
    ecdh.setPrivateKey(Buffer.from(privateKey, 'base64'));
    const publicKeyBuffer = Buffer.from(publicKey, 'base64');
    const sharedSecret = ecdh.computeSecret(publicKeyBuffer, 'base64', 'hex');
    const key = crypto.createHash('sha256').update(sharedSecret).digest();

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(payLoad, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag=cipher.getAuthTag().toString('hex');
    const secureMessage=iv.toString('hex')+encrypted+authTag;

    return { encryptedMessage: Buffer.from(secureMessage,'hex').toString('base64') };
}

export function decryptMessage(payLoad, privateKey, publicKey) {
    payLoad.forEach((data) => {
        if (data.text) {
            const decryptedText = decryptHelper(data.text, privateKey, publicKey, data.iv);
            data.text = decryptedText.decrypted;  
            data.qC = decryptedText.check;       
        } else if (data.image) {
            const decryptedImage = decryptHelper(data.image, privateKey, publicKey, data.iv);
            data.image = decryptedImage.decrypted;  
            data.qC = decryptedImage.check;         
        }
    });
    return payLoad;
}


function decryptHelper(data, privateKey, publicKey) {
    const ecdh = crypto.createECDH('secp256k1');
    ecdh.setPrivateKey(Buffer.from(privateKey, 'base64'));
    const publicKeyBuffer = Buffer.from(publicKey, 'base64');
    const sharedSecret = ecdh.computeSecret(publicKeyBuffer, 'base64', 'hex');
    const key = crypto.createHash('sha256').update(sharedSecret).digest();

    const payLoad=Buffer.from(data,'base64').toString('hex');
    const iv=payLoad.substr(0,24);
    const encyptData=payLoad.substr(24,payLoad.length - 24 - 32);
    const authTag=payLoad.substr(payLoad.length - 32, 32);

    try {
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(authTag,'hex'));
        let decrypted = decipher.update(encyptData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return {
            decrypted:decrypted,
            check:true
        };

    } catch (error) {
        return {
            decrypted:"Breached Message",
            check:false
        }
    }
}
