import {useAddressContext} from "../contexts/AddressContext";
import {useEffect, useState} from "react";
import {loadAccount, getHorizonServer} from "../stellar/sdk";
import {Link} from "react-router-dom";
import {ChevronDoubleRightIcon} from "@heroicons/react/16/solid/index.js";
import {useToast} from "../components/ToastProvider.jsx";

export default function AddressDetail({balances}) {
    const {currentAddress, addressMap} = useAddressContext();
    const [lockedXlm, setLockedXlm] = useState(null);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchReserve = async () => {
            if (!currentAddress) return;
            try {
                const account = await loadAccount(currentAddress);
                const subentryCount = account.subentry_count;
                const baseReserve = 0.5; // 0.5 XLM per subentry (Stellar base reserve)
                const locked = (2 + subentryCount) * baseReserve;
                setLockedXlm(locked);
            } catch (err) {
                console.error("Error loading account reserve:", err);
            }
        };
        fetchReserve();
    }, [currentAddress]);

    const name = addressMap[currentAddress]?.name || "Unnamed Wallet";
    const pub = currentAddress || "";
    const shortPub = pub.slice(0, 4) + "..." + pub.slice(-4);
    const assetCount = balances.length;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pub);
        showToast('success','Copied!')
    };

    return (
        <div className="bg-gray-100 rounded-md p-4 mb-4 text-sm border border-gray-200">
            <div className="divide-gray-300 divide-y grid grid-rows">
                {/* Display XLM balance and available balance */}
                {(() => {
                    const xlm = balances.find((b) => b.asset.code === "XLM");
                    if (!xlm) return null;

                    const total = parseFloat(xlm.balance);
                    const available =
                        lockedXlm != null ? (total - lockedXlm).toFixed(7) : null;

                    return (
                        <>
                            <div className="my-1 py-1 w-full">
                                <div className="text-base font-semibold text-blue-700 grid grid-cols-2">
                                    <span className={'text-start'}>💎 Total Balance:</span>
                                    <span className={'text-end'}>{total} XLM</span>
                                </div>

                            </div>
                            {available !== null && (
                                <div className="py-1 text-sm text-gray-600 grid grid-cols-2">
                                    <span className={'text-start'}>🟢 Available:</span>
                                    <span className={'text-end '}> {available} XLM</span>
                                </div>
                            )}
                        </>
                    );
                })()}
                <div className="my-1 py-1 text-sm text-gray-600 grid grid-cols-2">
                    <span className={'text-start'}>🔐 Wallet Name:</span>
                    <span className={'text-end '}> {name}</span>
                </div>
                <div className="my-1 py-1 text-sm text-gray-600 grid grid-cols-2">
                    <span className={'text-start'}>📬 Public Key:</span>
                    <span className={'text-end '}>
                    {shortPub}{" "}
                        <button
                            onClick={copyToClipboard}
                            className="text-blue-600  text-xs ml-2"
                        >
                    📋
                </button>
                </span>
                </div>
                <div className="my-1 py-1 text-sm text-gray-600 grid grid-cols-2">
                    <span className={'text-start'}>📦 Trustlines:</span>
                    <span className={'text-end '}>{assetCount}</span>
                </div>
                <div className="my-1 text-sm text-gray-600 grid grid-cols-2">
                    <span className={'text-start'}>🔒 Locked XLM:</span>
                    <span className={'text-end '}>{lockedXlm !== null ? lockedXlm.toFixed(7) : "..."}</span>
                </div>
            </div>
            <div className={"w-full justify-center grid"}>
                <Link
                    to="/history"
                    className="flex font-semibold text-sm text-blue-600 px-3 py-2 "
                >
                    History <ChevronDoubleRightIcon className=" w-4"/>
                </Link>
            </div>
        </div>
    );
}
