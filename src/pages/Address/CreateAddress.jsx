import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {generateNewKeypair} from "../../stellar/sdk";
import {useAddressContext} from "../../contexts/AddressContext";

export default function CreateAddress() {
    const {addAddress, addresses} = useAddressContext();
    const [name, setName] = useState("");
    const navigate = useNavigate();
    const handleCreate = () => {
        // Generate keypair & mnemonic, then add to storage and go to recovery screen
        const {secret,mnemonic} = generateNewKeypair();
        addAddress(secret, name || `Account ${addresses.length + 1}`);
        navigate("/recovery", {state: {mnemonic}});
    };

    return (
        <div className="p-4 space-y-4 max-w-md mx-auto ">
            <div className="">
                <h2 className="text-xl font-semibold mb-3">🔐 Create New Wallet</h2>
                <div className="text-gray-600 text-sm mb-3">
                    We don't have access to your password or secret keys. Everything is encrypted and stored in the browser.
                </div>
                <input
                    className="w-full my-2 p-2 border rounded text-sm border-gray-300 focus:outline-none"
                    type="text"
                    maxLength='20'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Wallet name (optional)"
                />
                <div className="w-full grid grid-cols-2 gap-x-2 my-3">
                    <button
                        onClick={handleCreate}
                        className=" bg-blue-600 text-white text-sm py-3 px-4 rounded font-semibold"
                    >
                        Create Wallet
                    </button>
                    <Link
                        to="/"
                        className="text-blue-600 py-2 rounded border border-blue-600"
                    >
                        Cancel
                    </Link>
                </div>
            </div>
            <div
                className="pb-2 flex items-center text-sm text-gray-600 before:flex-1 before:border-t before:border-gray-200 before:me-6 after:flex-1 after:border-t after:border-gray-200 after:ms-6 ">
                already have an account?
            </div>

            <Link
                to="/importAddress"
                className="my-3 border-2 border-blue-600 hover:border-blue-700 text-blue-600 text-sm py-3 px-4 rounded w-full block font-semibold"
            >
                Import Wallet
            </Link>
        </div>
    );
}
