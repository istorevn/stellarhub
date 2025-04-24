import { Keypair } from '@stellar/stellar-sdk';

export function isValidPublicKey(pub) {
    try {
        Keypair.fromPublicKey(pub);
        return true;
    } catch (e) {
        return false;
    }
}

export function isValidSecretKey(secret) {
    try {
        Keypair.fromSecret(secret);
        return true;
    } catch (e) {
        return false;
    }
}
