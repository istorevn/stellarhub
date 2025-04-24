import React, {useState} from "react";
import {Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle} from "@headlessui/react";
import {shortAddr} from "../utils/txSummary.js";

export default function AmountInput({amount, onAmountChange, token, onTokenChange, tokens}) {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState("");

    const filteredTokens = tokens.filter((t) =>
        t.code.toLowerCase().includes(filter.toLowerCase())
    );

    const closeModal = () => setIsOpen(false);
    const openModal = () => setIsOpen(true);

    return (
        <div className="flex flex-col ">
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
                <input
                    type="number"
                    className="w-full text-sm focus:outline-none "
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    placeholder="Amount to send"
                />
                <button
                    onClick={openModal}
                    className="ml-2 bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                    {token?.code || "Select Token"}
                </button>
            </div>

            {/* Token Picker Modal */}
            <Dialog open={isOpen} onClose={closeModal}>

                <DialogBackdrop className="fixed inset-0 bg-black/30"/>
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <DialogPanel className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
                        <DialogTitle className="text-center text-lg font-semibold mb-1">Select Token</DialogTitle>
                        <input
                            type="text"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full mb-4 p-2 border rounded text-sm"
                            placeholder="Search token..."
                        />
                        <div className="space-y-2 divide-y divide-gray-300">
                            {filteredTokens.map((t, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        onTokenChange(t);
                                        closeModal();
                                    }}
                                >
                                    <span>{t.code}</span>
                                    <span
                                        className="text-xs text-gray-500">{shortAddr(t.issuer)}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={closeModal}
                            className="mt-4 w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                            Close
                        </button>
                    </DialogPanel>
                </div>
            </Dialog>
        </div>
    );
}
