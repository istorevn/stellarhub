import { createContext, useContext, useState, useEffect } from "react";
import * as storage from "../utils/storage";
import { Keypair } from "@stellar/stellar-sdk";
import { getSelectedNetwork, setSelectedNetwork } from "../stellar/sdk";
import { useAuth } from "./AuthContext";

export const AddressContext = createContext();

export function AddressProvider({ children }) {
    const { user } = useAuth();
    const userId = user?.id || ""; // fallback if not logged in

    console.log('userId', userId)
    const [addresses, setAddresses] = useState([]); // array of publicKeys
    const [currentAddress, setCurrentAddressState] = useState(null);
    const [addressMap, setAddressMap] = useState({}); // publicKey => { publicKey, secretKey, name }
    const [network, setNetworkState] = useState(getSelectedNetwork());

    // On mount: load wallets and selected wallet
    useEffect( () => {
        if (!userId) ;

        const map = storage.getAddressMap(userId);
        const allAddresses = Object.keys(map);
        setAddresses(allAddresses);
        setAddressMap(map);

        const current = storage.getCurrentAddress(userId);
        if (current && map[current]) {
            setCurrentAddressState(current);
        } else if (allAddresses.length > 0) {
            setCurrentAddressState(allAddresses[0]);
            storage.setCurrentAddress(userId, allAddresses[0]);
        }
    }, [userId]);

    // Add wallet from secretKey
    const addAddress = (secretKey, name = "New Wallet") => {
        try {
            const keypair = Keypair.fromSecret(secretKey);
            const pub = keypair.publicKey();

            if (!addresses.includes(pub)) {
                const newList = [...addresses, pub];
                setAddresses(newList);

                const newMap = {
                    ...addressMap,
                    [pub]: {
                        publicKey: pub,
                        secretKey,
                        name,
                    },
                };
                setAddressMap(newMap);

                storage.addAddress(userId, pub, secretKey, name);
                setCurrentAddress(pub);
            }
        } catch (err) {
            console.error("❌ Invalid secret key:", err);
        }
    };

    // Set selected wallet
    const setCurrentAddress = (pub) => {
        setCurrentAddressState(pub);
        storage.setCurrentAddress(userId, pub);
    };

    // Rename a wallet
    const renameAddress = (pub, newName) => {
        const map = { ...addressMap };
        if (map[pub]) {
            map[pub].name = newName;
            setAddressMap(map);
            storage.renameAddress(userId, pub, newName);
        }
    };

    // Remove a wallet
    const removeAddress = (pub) => {
        const newAddresses = addresses.filter((a) => a !== pub);
        const newMap = { ...addressMap };
        delete newMap[pub];

        setAddresses(newAddresses);
        setAddressMap(newMap);
        storage.removeAddress(userId, pub);

        if (currentAddress === pub) {
            const fallback = newAddresses[0] || null;
            setCurrentAddress(fallback);
            storage.setCurrentAddress(userId, fallback);
        }
    };

    // Set network and persist
    const setNetwork = (value) => {
        setNetworkState(value);
        setSelectedNetwork(value);
    };

    // Get secret key from public key
    const getSecretKey = async (pub) => {
        return await addressMap[pub]?.secretKey;
    };

    const value = {
        addresses,
        addressMap,
        currentAddress,
        addAddress,
        setCurrentAddress,
        renameAddress,
        removeAddress,
        getSecretKey,
        network,
        setNetwork,
    };

    return (
        <AddressContext.Provider value={value}>
            {children}
        </AddressContext.Provider>
    );
}

export function useAddressContext() {
    return useContext(AddressContext);
}
