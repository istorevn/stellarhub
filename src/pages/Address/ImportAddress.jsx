import { useState } from "react";
import { getKeypairFromInput } from "../../stellar/sdk.js";
import { useAddressContext } from "../../contexts/AddressContext.jsx";
import {Link} from "react-router-dom";

export default function ImportAddress() {
    const { addAddress ,addresses} = useAddressContext();
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [name, setName] = useState("");

    const handleImport = () => {
        setError("");
        setSuccess("");

        try {
            const { keypair, type } = getKeypairFromInput(input);
            addAddress(keypair.secret(), name || `Account ${addresses.length + 1}`);
            setSuccess(`✅ Address imported: ${keypair.publicKey()}`);
        } catch (err) {
            setError("❌ " + err.message);
        }
    };

    return (
        <div className="p-4 space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-semibold">🧩 Import Address</h2>
            <div className="text-gray-600 text-sm mb-3 text-start">
                <p>Before starting the import process, do not forget to double-check the URL (the domain should be
                    StellarHub.link) and SSL validity(a small lock icon on the left of the address bar).</p>
                <p>Use this tool to import keys from any Stellar wallet or transfer your StellarHub account to another
                    browser/device.</p>
                <p>Copy-paste your key below:</p>
            </div>
            <input
                className="w-full my-2 p-2 border rounded text-sm border-gray-300 focus:outline-none"
                type="text"
                maxLength='20'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Wallet name (optional)"
            />
            <textarea
                className="w-full border rounded p-2 h-24 text-sm focus:outline-none"
                placeholder="Enter secret key or 24-word phrase"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <div className="text-gray-500 text-xs mb-3 text-start">
                <p>Supported formats:</p>
                <p>- 24-word StellarHub account passphrase backup</p>
                <p>- Stellar account secret key (starts with "S…")</p>
            </div>
            <div className="w-full grid grid-cols-2 gap-x-2">
                <button
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    onClick={handleImport}
                >
                    Import Address
                </button>
                <Link
                    to="/"
                    className="w-full text-blue-600 py-2 rounded border border-blue-600"
                >
                    Cancel
                </Link>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}
        </div>
    );
}
