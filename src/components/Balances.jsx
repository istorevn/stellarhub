import { useEffect, useState } from "react";
import { useAddressContext } from "../contexts/AddressContext";
import {
    fetchAssetInfo,
    getBalances,
    removeTrustline,
} from "../stellar/sdk";
import { Link } from "react-router-dom";
import AddressDetail from "./AddressDetail.jsx";
import {Button} from "@headlessui/react";
import AssetIcon from "./AssetIcon.jsx";

export default function Balances({ showAddressDetail = true }) {
    const { getSecretKey, currentAddress } = useAddressContext();
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [metaMap, setMetaMap] = useState({}); // key: code-issuer, value: { icon, domain }
    const [loadingAsset, setLoadingAsset] = useState(null);

    useEffect(() => {
        if (!currentAddress) return;

        setLoading(true);
        const fetchBalances = async () => {
            const bals = await getBalances(currentAddress);
            setBalances(bals);
            setLoading(false);

            const infoMap = {};
            for (const b of bals) {
                if (b.asset_type === "native") continue;
                const key = `${b.asset.code}-${b.asset.issuer}`;
                infoMap[key] = await fetchAssetInfo(b.asset.code, b.asset.issuer);
            }
            setMetaMap(infoMap);
        };

        fetchBalances();
    }, [currentAddress]);

    const handleRemoveTrustline = async (code, issuer) => {
        const secret = getSecretKey(currentAddress);
        if (!secret) return alert("Secret key not found");

        const confirmed = window.confirm(
            `Are you sure you want to remove trustline for ${code}?`
        );
        if (!confirmed) return;

        const key = `${code}-${issuer}`;
        setLoadingAsset(key);

        try {
            await removeTrustline(code, issuer, secret);
            const bals = await getBalances(currentAddress);
            setBalances(bals);
        } catch (err) {
            alert("❌ Failed to remove trustline: " + err.message);
        } finally {
            setLoadingAsset(null);
        }
    };

    if (!currentAddress) {
        return (
            <p className="text-sm text-gray-500">
                🔌 Please select a wallet address.
            </p>
        );
    }

    if (loading) {
        return <p className="text-sm text-gray-500">⏳ Loading balances...</p>;
    }

    if (balances.length === 0) {
        return (
            <div>
                <p className="text-sm text-gray-500">
                    Account doesn't exist on the ledger.
                </p>
                <p className="text-sm text-gray-500 my-2">
                    You need to fund it in order to send/receive assets.
                </p>
                <p className={' my-4'}>
                    <Link to={'/receive'} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">Receive</Link>
                </p>
            </div>
        );
    }

    if (error) {
        return <p className="text-sm text-red-500">{error}</p>;
    }

    return (
        <>
            {showAddressDetail && <AddressDetail balances={balances} />}
            <div className="mt-4 space-y-2">
                <Link
                    to="/trustlines"
                    className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
                >
                    ➕ Add Trustlines
                </Link>

                <div style={{ position: "relative", margin: "0.5rem 0" }}>
                    <input
                        type="text"
                        placeholder="Search token..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.5rem 2.5rem 0.5rem 0.5rem",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            style={{
                                position: "absolute",
                                right: "0.5rem",
                                top: "50%",
                                transform: "translateY(-50%)",
                                border: "none",
                                background: "transparent",
                                fontSize: "1rem",
                                cursor: "pointer",
                            }}
                            aria-label="Clear search"
                        >
                            ❌
                        </button>
                    )}
                </div>

                <div className={"divide-y-1 divide-gray-300"}>
                    {balances
                        .filter((b) => {
                            if (!search.trim()) return true;
                            const keyword = search.toLowerCase();
                            const code =
                                b.asset.type === "native"
                                    ? "xlm"
                                    : b.asset.code?.toLowerCase() || "";
                            return code.includes(keyword);
                        })
                        .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance))
                        .map((b, i) => {
                            const isNative = b.asset.type === "native";
                            const assetCode = isNative ? "XLM" : b.asset.code;
                            const issuer = isNative ? "stellar.org" : b.asset.issuer;
                            const key = isNative
                                ? "XLM-native"
                                : `${b.asset.code}-${b.asset.issuer}`;
                            const meta = metaMap[key] || {};
                            const displayIssuer = isNative
                                ? "stellar.org"
                                : meta.domain || `${issuer.slice(0, 4)}...${issuer.slice(-4)}`;
                            const icon = isNative ? "../src/assets/xlm.png" : meta.icon;
                            return (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-1"
                                >
                                    <div className="flex items-center space-x-2">
                                        <AssetIcon className="w-6 h-6" url={icon } />

                                        <div>
                                            <div className="text-start font-semibold">
                                                {assetCode}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {displayIssuer}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="font-mono text-end">
                                        <div>{parseFloat(b.balance).toFixed(2)}</div>
                                        <div className={"text-sm text-gray-400"}>
                                            {!isNative && (
                                                <button
                                                    onClick={() =>
                                                        handleRemoveTrustline(assetCode, issuer)
                                                    }
                                                    disabled={loadingAsset === key}
                                                    className="text-red-600 text-xs hover:underline"
                                                >
                                                    {loadingAsset === key
                                                        ? "Removing..."
                                                        : "Remove trustline"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </>
    );
}
