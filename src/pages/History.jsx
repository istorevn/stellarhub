import React, {useEffect, useState, useRef, useCallback} from "react";
import {useAddressContext} from "../contexts/AddressContext.jsx";
import {getNetworkPassphrase, getTransactions} from "../stellar/sdk.js";
import {renderOperationSummary, txLink} from "../utils/txSummary";
import {timeAgo} from "../utils/timeAgo";
import {getTxIcon} from "../utils/txIcons";
import {ExclamationTriangleIcon} from "@heroicons/react/24/outline";
import {Transaction} from "@stellar/stellar-sdk";

export default function History() {
    const {currentAddress} = useAddressContext();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cursor, setCursor] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchTxs = async (cursor = null) => {
        const isLoadMore = cursor !== null;
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        const {transactions: newTxs, nextCursor} = await getTransactions(
            currentAddress,
            cursor
        );

        setTransactions((prev) => (isLoadMore ? [...prev, ...newTxs] : newTxs));
        setCursor(nextCursor);
        setLoading(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        if (!currentAddress) return;
        fetchTxs(); // initial load
    }, [currentAddress]);

    const observer = useRef();
    const lastTxRef = useCallback(
        (node) => {
            if (loadingMore || loading) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && cursor) {
                    setLoadingMore(true);
                    fetchTxs(cursor);
                }
            });

            if (node) observer.current.observe(node);
        },
        [cursor, loadingMore, loading]
    );

    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold mb-4">Transaction History</h1>

            {loading ? (
                <div className="text-center py-4">
                    <div
                        className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"/>
                    <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
            ) : transactions.length === 0 ? (
                <p className={'text-sm text-gray-600'}>No transactions found.</p>
            ) : (
                <>
                    <ul className="space-y-4 divide-y divide-gray-300">
                        {transactions.map((op, i) => {
                            const Icon = getTxIcon(op.type);
                            return (
                                <li
                                    key={op.transaction_hash}
                                    ref={i === transactions.length - 1 ? lastTxRef : null}
                                    className="p-4 bg-white grid grid-cols-4 gap-1"
                                >
                                    <div className="col-span-3 text-start">
                                        <div className="font-mono text-sm break-all">
                                            <div className="flex" key={i}>
                                                <Icon
                                                    className={`w-5 h-5 mx-1 ${
                                                        op.transaction_successful ? "text-blue-500" : "text-gray-400"
                                                    }`}
                                                />
                                                <p
                                                    className="text-sm font-mono text-gray-800"
                                                    dangerouslySetInnerHTML={{
                                                        __html: renderOperationSummary(op),
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-1 text-end text-sm">
                                        <a href={txLink(op.transaction_hash)} className="flex justify-end">
                                            {!op.transaction_successful && (
                                                <div className="flex text-gray-500">
                                                    <ExclamationTriangleIcon className="w-4"/>
                                                    <span className="px-1">Transaction failed</span>
                                                </div>
                                            )}
                                            <span className="text-blue-500">
                                              {timeAgo(op.created_at)}
                                            </span>
                                        </a>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>

                    {loadingMore && (
                        <div className="text-center py-4">
                            <div
                                className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"/>
                            <p className="text-sm text-gray-500 mt-2">Loading more...</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
