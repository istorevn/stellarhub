import CryptoJS from "crypto-js";
const UID = 'uid'
export function encryptSecret(userId, secret) {
    return CryptoJS.AES.encrypt(secret.toString(), userId.toString())?.toString();
}

export function decryptSecret(userId,cipher) {

    if(!cipher) return null;
    const bytes = CryptoJS.AES.decrypt(cipher, userId);
    return bytes.toString(CryptoJS.enc.Utf8);
}
export function getUid() {
    return localStorage.getItem(UID);
}

export function setUid(uid) {
    return localStorage.setItem(UID, uid);
}

export function getAddresses(userId) {
    return Object.keys(getAddressMap(userId));
}

export function removeAddress(userId, pub) {
    const map = getAddressMap(userId);
    delete map[pub];
    localStorage.setItem(getWalletKey(userId), JSON.stringify(map));
}

// current address
export function getCurrentAddress(userId) {
    return localStorage.getItem(getCurrentKey(userId));
}


export function setCurrentAddress(userId, pub) {
    localStorage.setItem(getCurrentKey(userId), pub);
}

export function getSecretKey(userId, pub) {
    const wallet = getWallet(userId, pub);
    return wallet ? wallet.secretKey : null;
}

function getWalletKey(userId) {
    return `${userId}:wallets`;
}

function getCurrentKey(userId) {
    return `${userId}:current_address`;
}

export function getAddressMap(userId) {
    const raw = localStorage.getItem(getWalletKey(userId));
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    const result = {};

    for (const pub in parsed) {
        const {secretKey, name} = parsed[pub];
        const decryptKey = async () => {

            return await decryptSecret(userId, secretKey);
        };
        result[pub] = {
            publicKey: pub,
            secretKey: secretKey ?  decryptKey(secretKey) : null,
            name,
        };
    }

    return result;
}


export function getWallet(userId, pub) {
    return getAddressMap(userId)[pub] || null;
}

export function addAddress(userId, pub, secret, name = "New Account") {
    const current = getAddressMap(userId);

    current[pub] = {
        publicKey: pub,
        secretKey: encryptSecret(userId, secret),
        name,
    };
    localStorage.setItem(getWalletKey(userId), JSON.stringify(current));
}

export function renameAddress(userId, pub, newName) {
    const map = getAddressMap(userId);
    if (map[pub]) {
        map[pub].name = newName;
        localStorage.setItem(getWalletKey(userId), JSON.stringify(map));
    }
}

export function getCachedIcon(code, issuer) {
    const assetMeta = getCachedAssetMeta(code, issuer);
    return assetMeta?.image ||null;
}


export function cacheAssetMeta(assetMeta) {
    const key = assetMeta.code == 'XLM' ? `XLM` : `${assetMeta.code}-${assetMeta.issuer}`;
    localStorage.setItem(key, assetMeta);
}

export function getCachedAssetMeta(code, issuer) {
    const key = code == 'XLM' ? `XLM` : `${code}-${issuer}`;
    return localStorage.getItem(key);
}
export function getCachedDomain(code, issuer) {
    const assetMeta = getCachedAssetMeta(code, issuer);
    return assetMeta?.domain ||null;
}

