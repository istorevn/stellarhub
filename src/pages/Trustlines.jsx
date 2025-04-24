import React, {Fragment, useState} from "react";
import {useAddressContext} from "../contexts/AddressContext";
import {addTrustline} from "../stellar/sdk";
import {Dialog, Tab, Transition} from "@headlessui/react";
import clsx from "clsx";
import {CheckCircleIcon, XCircleIcon} from "@heroicons/react/24/outline";
import {useToast} from "../components/ToastProvider.jsx";
import {popularTokens} from "../constant/popularToken.js";
import {ClipLoader} from "react-spinners";
import AssetIcon from "../components/AssetIcon.jsx";

export default function AddTrustline() {
    const { showToast } = useToast();
    const { currentAddress, getSecretKey } = useAddressContext();
    const [assetCode, setAssetCode] = useState("");
    const [issuer, setIssuer] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [selectedToken, setSelectedToken] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const handleAdd = async (code = assetCode, iss = issuer) => {
        if (!code || !iss) {
            showToast("error","⚠️ Please fill in all fields.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const secret = await getSecretKey(currentAddress);
            await addTrustline(currentAddress, secret, code, iss);
            setShowConfirm(false);
            showToast("success", "Trustline added successfully!");

            setAssetCode("");
            setIssuer("");
        } catch (err) {
            console.error(err);
            showToast("error","❌ Error adding trustline.");
        } finally {

            setLoading(false);
            setShowConfirm(false);
        }
    };

    const openConfirm = (token) => {
        setSelectedToken(token);
        setShowConfirm(true);
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">➕ Add Trustline</h1>

            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded bg-gray-100 p-1 mb-4">
                    <Tab
                        className={({ selected }) =>
                            clsx(
                                "w-full py-2 text-sm font-medium rounded",
                                selected
                                    ? "bg-white shadow text-blue-600"
                                    : "text-gray-500 hover:bg-white"
                            )
                        }
                    >
                        Popular asset
                    </Tab>
                    <Tab
                        className={({ selected }) =>
                            clsx(
                                "w-full py-2 text-sm font-medium rounded",
                                selected
                                    ? "bg-white shadow text-blue-600"
                                    : "text-gray-500 hover:bg-white"
                            )
                        }
                    >
                        Custom asset
                    </Tab>
                </Tab.List>

                <Tab.Panels>
                    <Tab.Panel>
                        <div className="grid grid-cols-1 divide-y divide-gray-300">
                            {popularTokens.filter((token) => token.code != 'XLM')
                                .map((token) => (
                                <button
                                    key={token.code}
                                    onClick={() => openConfirm(token)}
                                    className=" p-3 hover:bg-blue-100 text-left"
                                    disabled={loading}
                                >
                                    <div className={'flex items-center space-x-2'}>

                                        <AssetIcon className="w-6 h-6" url={token.image} />

                                        <div>
                                            <p className="font-bold">{token.code}</p>
                                            <p className="text-xs text-gray-500">{token.domain}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Tab.Panel>

                    <Tab.Panel>
                        <div className="space-y-2">
                            <input
                                value={assetCode}
                                onChange={(e) => setAssetCode(e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 rounded text-sm my-3 focus:outline-none"
                                placeholder="Code"
                            />

                            <input
                                value={issuer}
                                onChange={(e) => setIssuer(e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 rounded text-sm font-mono my-3 focus:outline-none"
                                placeholder="Issuer"
                            />

                            <button
                                onClick={() => handleAdd()}
                                disabled={loading}
                                className={`w-full py-2 rounded text-white my-3 ${
                                    loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                                }`}
                            >
                                {loading ? (
                                    <span className="flex justify-center items-center gap-2">
                                        <ClipLoader size={18} color="#fff"/>
                                        Adding...
                                    </span>
                                ) : (
                                    "Add Trustline"
                                )}
                            </button>
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>

            {message && <p className="text-sm text-center mt-4">{message}</p>}

            <Transition appear show={showConfirm} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setShowConfirm(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30 bg-opacity-30 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-150"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
                                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                                        Add Trustline
                                    </Dialog.Title>
                                    {selectedToken && (
                                        <>
                                            <p className="mb-2">
                                                Create trustline for <strong>{selectedToken.code}</strong>?
                                            </p>
                                            <p className="text-xs text-gray-500 break-all mb-4">
                                                Issuer: {selectedToken.issuer}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-4">
                                                Asset trustline will temporarily lock 0.5 XLM on your account balance. Would you like to add this asset?
                                            </p>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setShowConfirm(false)}
                                                    className="flex items-center gap-1 px-4 py-1 text-sm rounded bg-gray-100 text-gray-700"
                                                >
                                                    <XCircleIcon className="w-4 h-4"/>
                                                    Cancel
                                                </button>

                                                <button
                                                    disabled={loading}
                                                    onClick={() =>
                                                        handleAdd(selectedToken.code, selectedToken.issuer)
                                                    }
                                                    className="flex items-center gap-1 px-4 py-1 text-sm rounded bg-green-600 text-white "
                                                >
                                                    { loading ? "Loading..." : <><CheckCircleIcon className="w-4 h-4"/> Ok</> }
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}

