// test/stellar/sdk.test.js
import {
    getSelectedNetwork,
    setSelectedNetwork,
    getNetworkPassphrase,
    loadAccount,
    getBalances,
    sendPayment,
    addTrustline,
    removeTrustline,
    getTransactions,
    getSwapRate,
    swap,
    convertToCandles,
    getKeypairFromInput,
    generateNewKeypair,
} from "../../src/stellar/sdk.js";
import { Networks } from "@stellar/stellar-sdk";
import { describe, it, expect, beforeAll } from "vitest";

// Helper to decide if we have test‐net keys
const TEST_PUBLIC = "GA7W6MMDVKC6UTGBW3XFXPBEGTK24TGUDFWHDTCOZIWCNSUZQWYKVG76";
const TEST_SECRET = "SCAVZVFMZ4H25EWOKPMXNRLPYPHF5T7YMOBFAEUTVD4EN5WPGETBZXOX";
const LIVE = false

describe("stellar/sdk — pure‐unit functions", () => {
    beforeAll(() => {
        // reset any localStorage from previous tests
        localStorage.clear();
    });

    it("defaults to public network and toggles properly", () => {
        expect(getSelectedNetwork()).toBe("public");

        setSelectedNetwork("testnet");
        expect(getSelectedNetwork()).toBe("testnet");
        expect(getNetworkPassphrase()).toBe(Networks.TESTNET);

        setSelectedNetwork("public");
        expect(getSelectedNetwork()).toBe("public");
        expect(getNetworkPassphrase()).toBe(Networks.PUBLIC);
    });

    it("convertToCandles buckets trades correctly", () => {
        const hour = 3600;
        const baseTs = 1_600_000_000;
        // 3 trades: two in same hour, one in next
        const trades = [
            { timestamp: baseTs + 10, price: { n: "2", d: "1" }, base_amount: "1" },
            { timestamp: baseTs + 1800, price: { n: "3", d: "1" }, base_amount: "2" },
            { timestamp: baseTs + hour + 5, price: { n: "4", d: "1" }, base_amount: "3" },
        ];
        const candles = convertToCandles(trades, hour);

        // Should produce 2 candles
        expect(candles).toHaveLength(2);

        // First bucket: open=2, high=3, low=2, close=3, volume=3
        expect(candles[0]).toMatchObject({
            open: 2,
            high: 3,
            low: 2,
            close: 3,
            volume: 3,
            time: Math.floor(baseTs / hour) * hour,
        });

        // Second bucket: single trade of price=4, volume=3
        expect(candles[1]).toMatchObject({
            open: 4,
            high: 4,
            low: 4,
            close: 4,
            volume: 3,
            time: Math.floor((baseTs + hour + 5) / hour) * hour,
        });
    });

    it("getKeypairFromInput() handles secret keys and mnemonics", () => {
        const { secret, publicKey, mnemonic } = generateNewKeypair();
        // from secret
        const fromSecret = getKeypairFromInput(secret);
        expect(fromSecret.type).toBe("secret");
        expect(fromSecret.keypair.publicKey()).toBe(publicKey);

        // from mnemonic
        const fromMnemo = getKeypairFromInput(mnemonic);
        expect(fromMnemo.type).toBe("mnemonic");
        expect(fromMnemo.keypair.publicKey()).toBe(publicKey);
    });

    it("generateNewKeypair() creates valid 24‑word mnemonic", () => {
        const kp = generateNewKeypair();
        expect(kp.secret.startsWith("S")).toBe(true);
        expect(kp.publicKey.startsWith("G")).toBe(true);
        expect(kp.mnemonic.split(" ").length).toBe(24);
    });
});

(LIVE ? describe : describe.skip)("stellar/sdk — integration against testnet", () => {
    let initialBalance;

    it("loadAccount() fetches the test account", async () => {
        const acct = await loadAccount(TEST_PUBLIC);
        expect(acct.accountId()).toBe(TEST_PUBLIC);
    });

    it("getBalances() returns at least XLM", async () => {
        const bals = await getBalances(TEST_PUBLIC);
        expect(bals.some((b) => b.asset.code === "XLM")).toBe(true);
        initialBalance = bals.find((b) => b.asset.code === "XLM").balance;
    });

    it("sendPayment() to self decrements XLM", async () => {
        // send a tiny amount
        const res = await sendPayment({
            secret: TEST_SECRET,
            from: TEST_PUBLIC,
            to: TEST_PUBLIC,
            amount: "0.00001",
            assetCode: "XLM",
            assetIssuer: null,
            memo: "Vitest",
        });
        expect(res.hash).toBeDefined();

        const after = await getBalances(TEST_PUBLIC);
        const xlm = parseFloat(after.find((b) => b.asset.code === "XLM").balance);
        expect(xlm).toBeLessThan(parseFloat(initialBalance));
    });

    it("addTrustline() and removeTrustline() for a dummy asset", async () => {
        // Use an asset issuer that's also TEST_PUBLIC for simplicity
        const code = "DEMO";
        const issuer = TEST_PUBLIC;
        await addTrustline(TEST_PUBLIC, TEST_SECRET, code, issuer);

        let bals = await getBalances(TEST_PUBLIC);
        expect(bals.some((b) => b.asset.code === code)).toBe(true);

        await removeTrustline(code, issuer, TEST_SECRET);
        bals = await getBalances(TEST_PUBLIC);
        expect(bals.some((b) => b.asset.code === code)).toBe(false);
    });

    it("getTransactions() returns records and paging", async () => {
        const { transactions, nextCursor } = await getTransactions(TEST_PUBLIC, null, 5);
        expect(Array.isArray(transactions)).toBe(true);
        if (transactions.length) {
            expect(transactions[0].id).toBeDefined();
            expect(nextCursor).toBeDefined();
        }
    });

    it("getSwapRate() between XLM ➝ XLM returns a number", async () => {
        const rateObj = await getSwapRate({
            sendAsset: { code: "XLM", issuer: null },
            sendAmount: "1",
            receiveAsset: { code: "XLM", issuer: null },
        });
        expect(rateObj.rate).toBeGreaterThan(0);
    });

    it("swap() pathPaymentStrictSend of XLM ➝ XLM succeeds", async () => {
        const { ok } = await swap(
            { code: "XLM", issuer: null },
            { code: "XLM", issuer: null },
            "0.00001",
            "0.000009",
            TEST_SECRET
        );
        expect(ok).toBe(true);
    });
});
