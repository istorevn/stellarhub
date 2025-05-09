import React, {useEffect, useState} from "react";
import {getSwapRate, swap} from "../stellar/sdk";
import SwapAmountInput from "../components/SwapAmountInput";
import {useToast} from "../components/ToastProvider.jsx";
import {ClipLoader} from "react-spinners";
import {useAddressContext} from "../contexts/AddressContext.jsx";
export default function Swap() {
    const {showToast} = useToast();
    const {currentAddress, getSecretKey} = useAddressContext();

    const [sendAmount, setSendAmount] = useState("");
    const [receiveAmount, setReceiveAmount] = useState("");
    const [sendToken, setSendToken] = useState("");
    const [receiveToken, setReceiveToken] = useState("");
    const [spread, setSpread] = useState(0.5);
    const [swapRate, setSwapRate] = useState(0);
    const [minToReceive, setMinToReceive] = useState(0);

    const [isSendTokenModalOpen, setIsSendTokenModalOpen] = useState(false);
    const [isReceiveTokenModalOpen, setIsReceiveTokenModalOpen] = useState(false);

    const [loadingRate, setLoadingRate] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);

    useEffect(() => {
        if (sendAmount && receiveAmount) {
            const minReceive = parseFloat(receiveAmount) * (1 - spread / 100);
            setMinToReceive(minReceive.toFixed(6));
        }

        async function fetchRate() {
            if (!sendToken || !receiveToken || !sendAmount || isNaN(sendAmount)) return;

            setLoadingRate(true);

            const result = await getSwapRate({
                sendAsset: sendToken,
                sendAmount,
                receiveAsset: receiveToken,
            });

            if (result) {
                setReceiveAmount(result.destinationAmount);
                setSwapRate(result.rate.toFixed(6));
                const minReceive = result.destinationAmount * (1 - spread / 100);
                setMinToReceive(minReceive.toFixed(6));
            } else {
                showToast("error", "Error fetching rate.");
            }

            setLoadingRate(false);
        }

        fetchRate();
    }, [sendAmount, sendToken, receiveToken, spread]);

    const performSwap = async () => {
        if (isSwapping) return;
        if (!sendAmount || !receiveAmount || !sendToken || !receiveToken) {
            showToast("error","⚠️ Please fill in all fields.");
            return;
        }

        setIsSwapping(true);
        const secret = await getSecretKey(currentAddress);

        await swap(sendToken, receiveToken, sendAmount, minToReceive, secret);
        showToast("success", "Swap processed successfully");
        setIsSwapping(false);
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Swap</h1>

            {/* Send Section */}
            <SwapAmountInput
                key="send"
                label="Send"
                amount={sendAmount}
                onAmountChange={setSendAmount}
                token={sendToken}
                onTokenChange={setSendToken}
                isOpen={isSendTokenModalOpen}
                openModal={() => setIsSendTokenModalOpen(true)}
                closeModal={() => setIsSendTokenModalOpen(false)}
            />

            {/* Receive Section */}
            <SwapAmountInput
                key="receive"
                label="Receive"
                amount={receiveAmount}
                onAmountChange={setReceiveAmount}
                token={receiveToken}
                onTokenChange={setReceiveToken}
                isOpen={isReceiveTokenModalOpen}
                openModal={() => setIsReceiveTokenModalOpen(true)}
                closeModal={() => setIsReceiveTokenModalOpen(false)}
            />

            {/* Spread Selection */}
            <div className="py-2 mb-4 flex text-sm w-full max-w-full ">
                <p className="text-gray-600 mr-2 ">Spread:</p>
                <div className="grid grid-cols-4 gap-0">

                    {["0.5%", "1.0%", "2.5%", "5%"].map((percentage,idx) => (
                        <div role="radiogroup ">
                            <input
                                id={`s${percentage}`}
                                type="radio"
                                name="spread"
                                value={percentage}
                                checked={spread === parseFloat(percentage)}
                                onChange={() => setSpread(parseFloat(percentage))}
                                className="mr-2 hidden peer"
                            />
                            <label htmlFor={`s${percentage}`} key={percentage}
                                   className={[
                                       'text-xs peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-white flex items-center border border-gray-200 px-2 py-1',
                                       idx === 0 && 'rounded-l',
                                       idx === 3 && 'rounded-r'
                                   ].join(' ')}>
                                {percentage}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Perform Swap Button */}
            <button
                onClick={performSwap}
                disabled={isSwapping}
                className={`my-4 w-full py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700`}
            >
                {isSwapping ? (
                    <span className="flex justify-center items-center gap-2">
                        <ClipLoader size={18} color="#fff"/>
                        Swapping...
                      </span>
                ) : (
                    "Swap"
                )}
            </button>

            {/* Swap Rate */}
            <div className="grid grid-cols-2 gap-2 my-2 text-sm">
                <div className="text-gray-500 text-start">
                    Swap Rate:
                </div>
                <div className="font-mono text-end text-blue-600">{loadingRate ? <ClipLoader size={16} color="#3b82f6"/> : swapRate}</div>
            </div>

            {/* Minimum to Receive */}
            <div className="grid grid-cols-2 gap-2 my-2 text-sm">
                <div className="text-gray-500 text-start">Minimum to Receive:</div>
                <div className="font-mono text-end text-blue-600">{minToReceive}</div>
            </div>
        </div>
    );
}
