import React from "react";
import {AuthContext} from "../../src/contexts/AuthContext";
import {ToastProvider} from "../../src/components/ToastProvider";
import {AddressContext} from "../../src/contexts/AddressContext";

import {MemoryRouter} from "react-router-dom";

const mockAddress = "GMOCKPUBKEYEXAMPLE12345678901234567890ABC";
const mockSecret = "SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

export function MockAppProviders({children}) {
    const authValue = {user: {id: "mock-user"}};

    const addressValue = {
        addresses: [mockAddress],
        currentAddress: mockAddress,
        addressMap: {
            [mockAddress]: {
                publicKey: mockAddress,
                secretKey: mockSecret,
                name: "Test Wallet",
            },
        },
        getSecretKey: () => mockSecret,
        addAddress: () => {
        },
        setCurrentAddress: () => {
        },
        renameAddress: () => {
        },
        removeAddress: () => {
        },
        network: "testnet",
        setNetwork: () => {
        },
    };

    return (
        <MemoryRouter>
            <AuthContext.Provider value={authValue}>
                <ToastProvider>
                    <AddressContext.Provider value={addressValue}>
                        {children}
                    </AddressContext.Provider>
                </ToastProvider>
            </AuthContext.Provider>
        </MemoryRouter>
    );
}
