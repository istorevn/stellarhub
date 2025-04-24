import { useAddressContext } from "../contexts/AddressContext";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function Receive() {
    const { currentAddress } = useAddressContext();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!currentAddress) return;
        navigator.clipboard.writeText(currentAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleShare = () => {
        if (!navigator.share || !currentAddress) return;
        navigator.share({
            title: "Stellar Wallet Address",
            text: currentAddress,
        });
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">📥 Receive</h1>

            {currentAddress ? (
                <div className="bg-white border border-gray-300 rounded p-4 shadow text-center">
                    <p className="text-gray-600 text-sm mb-1">Your wallet address:</p>
                    <p className="break-all font-mono text-blue-600 text-sm mb-3">
                        {currentAddress}
                    </p>

                    <div className="flex justify-center mb-4">
                        <QRCodeCanvas value={currentAddress} size={160} />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                            onClick={handleCopy}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                        >
                            {copied ? "✅ Copied!" : "📋 Copy address"}
                        </button>

                        {navigator.share && (
                            <button
                                onClick={handleShare}
                                className="bg-gray-100 px-4 py-2 rounded text-sm text-gray-700 hover:bg-gray-200"
                            >
                                📤 Share
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-gray-500">No address selected.</p>
            )}
        </div>
    );
}
