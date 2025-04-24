import CryptoJS from "crypto-js";

const ADDRESSES_KEY = "addresses";
const CURRENT_KEY = "currentAddress";
const SECRET_KEY = "secrets";
const AES_KEY = "stellar-wallet-123";

export function encryptSecret(secret) {
    return CryptoJS.AES.encrypt(secret, AES_KEY).toString();
}

export function decryptSecret(cipher) {

    if(!cipher) return null;
    const bytes = CryptoJS.AES.decrypt(cipher, AES_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
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


export function saveSecretKey(publicKey, secret) {
    const json = localStorage.getItem(SECRET_KEY);
    const map = json ? JSON.parse(json) : {};
    map[publicKey] = secret;
    localStorage.setItem(SECRET_KEY, JSON.stringify(map));
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

            return await decryptSecret(secretKey);
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

// Thêm ví mới
export function addAddress(userId, pub, secret, name = "Ví mới") {
    const current = getAddressMap(userId);

    current[pub] = {
        publicKey: pub,
        secretKey: encryptSecret(secret),
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

