// Trade.jsx
import { useEffect, useState } from "react";
import TradeChart from "../components/TradeChart";
import { fetchCandleData } from "../stellar/sdk";

const tokenList = [
    { code: "XLM", issuer: null },
    { code: "USDC", issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" },
    { code: "yXLM", issuer: "GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55" },
];

const resolutions = [
    { label: "1H", value: 3600 },
    { label: "4H", value: 14400 },
    { label: "1D", value: 86400 },
];

export default function Trade() {
    const [base, setBase] = useState(tokenList[0]);
    const [quote, setQuote] = useState(tokenList[1]);
    const [resolution, setResolution] = useState(3600);
    const [data, setData] = useState([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const load = async () => {
            const candles = await fetchCandleData(base, quote, resolution);
            setData(candles);
            setHasMore(true);
        };
        load();
    }, [base, quote, resolution]);

    const handleLoadMore = async (oldestTime) => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);

        const newCandles = await fetchCandleData(
            base,
            quote,
            resolution,
            oldestTime - 100 * resolution
        );

        if (!newCandles.length) {
            setHasMore(false);
            setLoadingMore(false);
            return;
        }

        const merged = [...newCandles, ...data].filter(
            (v, i, self) => i === self.findIndex((t) => t.time === v.time)
        );

        setData(merged);
        setLoadingMore(false);
    };

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Base asset:</label>
                    <select
                        value={base.code}
                        onChange={(e) => {
                            const selected = tokenList.find((t) => t.code === e.target.value);
                            setBase(selected);
                        }}
                        className="w-full border px-3 py-2 rounded text-sm"
                    >
                        {tokenList.map((t) => (
                            <option key={t.code} value={t.code}>
                                {t.code}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Quote asset:</label>
                    <select
                        value={quote.code}
                        onChange={(e) => {
                            const selected = tokenList.find((t) => t.code === e.target.value);
                            setQuote(selected);
                        }}
                        className="w-full border px-3 py-2 rounded text-sm"
                    >
                        {tokenList.map((t) => (
                            <option key={t.code} value={t.code}>
                                {t.code}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex gap-2 mb-2">
                {resolutions.map((r) => (
                    <button
                        key={r.value}
                        onClick={() => setResolution(r.value)}
                        className={`px-3 py-1 rounded text-sm border ${
                            resolution === r.value
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700"
                        }`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            <TradeChart data={data} onLoadMore={handleLoadMore} />
            {loadingMore && (
                <div className="text-sm text-center text-gray-500 animate-pulse">
                    ⏳ Loading more data...
                </div>
            )}
            {!hasMore && (
                <div className="text-xs text-center text-gray-400">
                    No more historical data available.
                </div>
            )}
        </div>
    );
}
