import React, { useState, useEffect } from "react";
import { Keypair } from "@stellar/stellar-sdk";
import { useAddressContext } from "../contexts/AddressContext";
import { loadAccount, sendPayment } from "../stellar/sdk";
import { isValidPublicKey } from "../utils/validators.js";
import AmountInput from "../components/AmountInput";
import {ClipLoader} from "react-spinners";
import {useToast} from "../components/ToastProvider.jsx";

export default function Send() {
    const {showToast} = useToast();

    const { currentAddress, addressBook, getSecretKey } = useAddressContext();
    const [balances, setBalances] = useState([]);
    const [to, setTo] = useState("");
    const [amount, setAmount] = useState("");
    const [memo, setMemo] = useState("");
    const [memoType, setMemoType] = useState("none");
    const [token, setToken] = useState({ code: "XLM", issuer: null });
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchBalances = async () => {
            if (!currentAddress) return;
            const account = await loadAccount(currentAddress);
            const mapped = account.balances.map((b) =>
                b.asset_type === "native"
                    ? { code: "XLM", issuer: null, balance: b.balance }
                    : {
                        code: b.asset_code,
                        issuer: b.asset_issuer,
                        balance: b.balance,
                    }
            );
            setBalances(mapped);
        };
        fetchBalances();
    }, [currentAddress]);

    const validate = () => {

        if (!isValidPublicKey(to)) {
            return "❌ Invalid recipient address.";
        }
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            return "❌ Invalid amount.";
        }

        if (amount !== "" && !/^\d*(?:\.\d{0,7})?$/.test(amount)) {
            return "❌ Invalid amount.";
        }

        const selected = balances.find(
            (b) => b.code === token.code && b.issuer === token.issuer
        );
        if (!selected) {
            return "❌ Token not found in your account.";
        }
        if (parseFloat(amount) > parseFloat(selected.balance)) {
            return "❌ Insufficient balance.";
        }
        return "";
    };

    const handleSend = async () => {
        const validation = validate();
        if (validation) {
            setError(validation);
            showToast("error",validation);

            return;
        }

        setError("");
        setSuccess("");
        setSending(true);

        try {
            const secret = await getSecretKey(currentAddress);
            await sendPayment({
                secret,
                from: currentAddress,
                to,
                amount,
                assetCode: token.code,
                assetIssuer: token.issuer,
                memo: memo,
                addressBook,
            });
            // setSuccess("✅ Transaction sent!");
            showToast("success","Transfer processed successfull");

            setTo("");
            setAmount("");
            setMemo("");
            setMemoType("none");
        } catch (err) {
            console.error(err);
            setError("❌ Transaction failed.");
        } finally {
            setSending(false);
        }
    };

    const selectedBalance = balances.find(
        (b) => b.code === token.code && b.issuer === token.issuer
    );

    const fillAmount = (percent) => {
        if (!selectedBalance) return;
        const amt = (parseFloat(selectedBalance.balance) * percent).toFixed(7);
        setAmount(amt);
    };

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-xl font-bold">📤 Send Token</h1>

            {!currentAddress && (
                <p className="text-sm text-red-500">
                    ❗ Please select a wallet address first.
                </p>
            )}

            <div className="space-y-2">
                <input
                    className="w-full border border-gray-300 px-3 py-3 rounded text-sm mb-4 focus:outline-none"
                    placeholder="Recipient address"
                    value={to}
                    onChange={(e) => setTo(e.target.value.trim())}
                />

                <AmountInput
                    amount={amount}
                    onAmountChange={setAmount}
                    token={token}
                    onTokenChange={setToken}
                    tokens={balances}
                />

                {selectedBalance && (
                    <div className="w-full flex gap-2 text-xs justify-end">
                        <button onClick={() => fillAmount(1)} className="text-gray-500">
                            {parseFloat(selectedBalance.balance)} {token.code}
                        </button>
                        <button onClick={() => fillAmount(0.25)} className="text-blue-600">
                            25%
                        </button>
                        <button onClick={() => fillAmount(0.5)} className="text-blue-600">
                            50%
                        </button>
                        <button onClick={() => fillAmount(1)} className="text-blue-600">
                            100%
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 my-3">
                    <input
                        className="w-full border border-gray-300 px-3 py-3 rounded text-sm mt-1 focus:outline-none"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="Memo"
                    />
                </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <button
                disabled={sending}
                onClick={handleSend}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
            >
                {sending ? (
                    <span className="flex justify-center items-center gap-2">
                        <ClipLoader size={18} color="#fff"/>
                        Sending...
                      </span>
                ) : (
                    "Send"
                )}
            </button>
        </div>
    );
}
