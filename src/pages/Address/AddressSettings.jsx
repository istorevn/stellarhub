// src/pages/Address/AddressSettings.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddressContext } from "../../contexts/AddressContext";
import {accountHref, shortAddr} from "../../utils/txSummary.js";

export default function AddressSettings() {
    const {
        currentAddress,
        addressMap,
        renameAddress,
        removeAddress,
        getSecretKey,
    } = useAddressContext();

    const [name, setName] = useState(addressMap[currentAddress]?.name || "");
    const [showSecret, setShowSecret] = useState(false);
    const [secret, setSecret] = useState('');
    const navigate = useNavigate();

    if (!currentAddress) {
        return <div className="p-4 text-sm text-red-500">No address selected.</div>;
    }

    const handleRename = (newName) => {
        if (!newName.trim()) return;
        renameAddress(currentAddress, newName.trim());
        setName(newName)
    };

    const handleShowSecret = async () => {
        setSecret(await getSecretKey(currentAddress))
        setShowSecret(!showSecret);
    };

    const handleRemove = () => {
        const confirmed = window.confirm("Are you sure you want to remove this wallet?");
        if (!confirmed) return;

        removeAddress(currentAddress);
        alert("✅ Wallet removed");
        navigate("/");
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">⚙️ Address Settings</h1>

            <div className="mb-4">
                <label className="text-start font-semibold text-base block mb-1">Public key: <a className={"text-blue-500"} href={accountHref(currentAddress)}>[{addressMap[currentAddress]?.name || ""}] {shortAddr(currentAddress)}</a></label>

            </div>

            <div className="mb-4 text-left">
                <label className="  block font-semibold text-base mb-1">Wallet Name</label>
                <small className={'text-gray-500 text-xs'}>
                    Setting wallet name makes it easier to identify an account when you are using more than one
                </small>
                <input
                    type="text"
                    value={addressMap[currentAddress]?.name || ""}
                    onChange={(e) => handleRename(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none"
                    placeholder="Wallet name"
                />

            </div>

            <div className="mb-4 text-left">
                <label className="text-start  block font-semibold text-base mb-1">Secret key</label>
                <p className={'text-gray-500 text-xs my-3'}>
                    The secret key is used internally to sign Stellar transactions and authenticate account identity on
                    third-party services. Corresponding 24-word recovery passphrase is the backup of your secret key.
                </p>
                <p className={'text-gray-500 text-xs my-3 text-rose-600'}>
                    Do not share your secret key. Do not trust any person or website asking it. Avoid
                    storing it in unsafe places, your phone, or computer in the plaintext. Anyone with this key will
                    have access to funds stored on your account.
                </p>
                <input
                    type={showSecret ? "text" : "password"}
                    readOnly
                    placeholder={"Click here to reveal secret key"}
                    onClick={handleShowSecret}
                    value={secret}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none"
                />
            </div>

            <div className="mt-6">
                <label className="text-start  block font-semibold text-base mb-1">Remove wallet</label>
                <p className={'text-start text-gray-500 text-xs my-3'}>
                    Please make sure that you have the backup of secret key somewhere because you will no longer have
                    access to this account from StellarHub on your current device once you delete it.
                </p>
                <button
                    onClick={handleRemove}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm"
                >
                    🗑️ Remove Wallet
                </button>
                <p className={'text-start text-gray-500 text-xs my-3'}>
                    After removing wallet, your account still exists and works normally on the Stellar network.
                </p>
            </div>
        </div>
    );
}
