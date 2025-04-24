import React, { useState } from "react";
import {Dialog, DialogBackdrop, DialogPanel, DialogTitle} from "@headlessui/react";
import { useAddressContext } from "../contexts/AddressContext";
import { popularTokens } from "../constant/popularToken.js";
import {shortAddr} from "../utils/txSummary.js";

const SwapAmountInput = ({
                             label,
                             amount,
                             onAmountChange,
                             token,
                             onTokenChange,
                             isOpen,
                             openModal,
                             closeModal,
                         }) => {
    const [filter, setFilter] = useState("");
    const { addresses } = useAddressContext();

    // Filter tokens by added trustlines or popular tokens
    const filteredTokens = [
        ...addresses
            .filter((address) => address.tokens && address.tokens.includes(token))
            .map((address) => ({ code: address.token, issuer: address.issuer })),
        ...popularTokens.filter((token) =>
            token.code.toLowerCase().includes(filter.toLowerCase())
        ),
    ];

    return (
        <div className="flex flex-col mb-4">
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
                <input
                    type="text"
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    className="w-full text-sm focus:outline-none"
                    placeholder={label}
                    data-testid={`amount-input-${label.toLowerCase()}`}
                />
                <button
                    onClick={openModal}
                    className="ml-2 min-w-fit px-2 py-1 bg-blue-600 text-white rounded text-sm"
                >
                    {token.code || "Select Token"}
                </button>
            </div>

            {/* Token Selection Modal */}
            <Dialog open={isOpen} onClose={closeModal}>
                <DialogBackdrop className="fixed inset-0 bg-black/30"/>

                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <DialogPanel className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
                        <DialogTitle className="text-center text-lg font-semibold mb-1">Select Token</DialogTitle>
                        <input
                            type="text"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
                            placeholder="Search token..."
                        />
                        <div className="space-y-2 divide-y divide-gray-300">
                            {filteredTokens.map((token) => (
                                <div
                                    key={token.code}
                                    className="flex justify-between items-center p-2  cursor-pointer hover:bg-gray-100"
                                    onClick={() => {
                                        onTokenChange(token); // Select token
                                        closeModal(); // Close modal
                                    }}
                                >
                                    <span>{token.code}</span>
                                    <span className="text-sm text-gray-500">{shortAddr(token.issuer)}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={closeModal}
                            className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            Close
                        </button>
                    </DialogPanel>
                </div>

            </Dialog>
        </div>
    );
};

export default SwapAmountInput;
