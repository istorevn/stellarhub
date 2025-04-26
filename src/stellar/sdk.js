import {
    Horizon,
    Keypair,
    Asset,
    TransactionBuilder,
    Networks,
    Operation,
    Memo,
    Transaction
} from '@stellar/stellar-sdk';
import {derivePath} from "ed25519-hd-key";
import {
    getCachedIcon,
    getCachedDomain,
    getSecretKey, cacheAssetMeta, getCachedAssetMeta
} from "../utils/storage";
import {popularTokens} from "../constant/popularToken.js";
import {mnemonicToSeedSync, generateMnemonic, validateMnemonic} from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'
import nacl from "tweetnacl";

export const NETWORK_KEY = "stellar-network";
export const DEFAULT_NETWORK = "public";

export function getSelectedNetwork() {
    const net = localStorage.getItem(NETWORK_KEY);
    return net === "testnet" ? "testnet" : DEFAULT_NETWORK;
}

export function setSelectedNetwork(value) {
    localStorage.setItem(NETWORK_KEY, value);
}

export function getHorizonServer() {
    const network = getSelectedNetwork();
    const url =
        network === "testnet"
            ? "https://horizon-testnet.stellar.org"
            : "https://horizon.stellar.org";
    return new Horizon.Server(url);
}

export function getNetworkPassphrase() {
    return getSelectedNetwork() === "testnet" ? Networks.TESTNET : Networks.PUBLIC;
}

export function loadAccount(publicKey) {
    return getHorizonServer().loadAccount(publicKey);
}

export async function sendPayment({secret, from, to, amount, assetCode, assetIssuer, memo}) {
    const server = getHorizonServer();
    const account = await server.loadAccount(from);
    const fee = await server.fetchBaseFee();

    const asset = assetCode === "XLM" ? Asset.native() : new Asset(assetCode, assetIssuer);

    const txBuilder = new TransactionBuilder(account, {
        fee,
        networkPassphrase: getNetworkPassphrase(),
    }).addOperation(
        Operation.payment({
            destination: to,
            asset,
            amount: amount.toString(),
        })
    );

    if (memo) {
        txBuilder.addMemo(Memo.text(memo));
    }

    const tx = txBuilder.setTimeout(180).build();
    const keypair = Keypair.fromSecret(secret);
    tx.sign(keypair);

    return await server.submitTransaction(tx);
}

export async function addTrustline(currentAddress, secret, assetCode, assetIssuer) {
    const server = getHorizonServer();
    const keypair = Keypair.fromSecret(secret);
    const publicKey = keypair.publicKey();

    const account = await server.loadAccount(publicKey);
    const asset = new Asset(assetCode, assetIssuer);

    const tx = new TransactionBuilder(account, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: getNetworkPassphrase(),
    })
        .addOperation(Operation.changeTrust({asset}))
        .setTimeout(180)
        .build();

    tx.sign(keypair);
    return await server.submitTransaction(tx);
}

export async function removeTrustline(code, issuer, secret) {
    const server = getHorizonServer();
    const keypair = Keypair.fromSecret(secret);
    const account = await server.loadAccount(keypair.publicKey());

    const asset = new Asset(code, issuer);
    const tx = new TransactionBuilder(account, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: getNetworkPassphrase(),
    })
        .addOperation(
            Operation.changeTrust({
                asset,
                limit: "0",
            })
        )
        .setTimeout(30)
        .build();

    tx.sign(keypair);
    await server.submitTransaction(tx);
}

export async function getBalances(publicKey) {
    try {
        const account = await getHorizonServer().loadAccount(publicKey);
        return account.balances
            .filter((b) => b.asset_type !== "liquidity_pool_shares")
            .map((b) => {
                const asset =
                    b.asset_type === "native"
                        ? {code: "XLM", issuer: null, type: "native"}
                        : {code: b.asset_code, issuer: b.asset_issuer, type: "credit_alphanum4"};

                return {
                    asset,
                    balance: b.balance,
                };
            });
    } catch (err) {
        console.info("Error loading balances:", err);
        return [];
    }
}

export async function getSwapRate({sendAsset, sendAmount, receiveAsset}) {
    try {
        const server = getHorizonServer();

        const sourceAsset = sendAsset.code === "XLM"
            ? Asset.native()
            : new Asset(sendAsset.code, sendAsset.issuer);

        const destinationAsset = receiveAsset.code === "XLM"
            ? Asset.native()
            : new Asset(receiveAsset.code, receiveAsset.issuer);

        const response = await server
            .strictSendPaths(sourceAsset, sendAmount, [destinationAsset])
            .call();

        const bestPath = response.records[0];
        if (!bestPath) return null;

        return {
            rate: parseFloat(bestPath.destination_amount) / parseFloat(sendAmount),
            destinationAmount: bestPath.destination_amount,
            path: bestPath.path,
        };
    } catch (e) {
        console.error("getSwapRate error", e);
        return null;
    }
}

export async function getTransactions(publicKey, cursor = null, limit = 10) {
    const server = getHorizonServer();

    let builder = server
        .operations()
        .forAccount(publicKey)
        .includeFailed(true)
        .order("desc")
        .limit(limit);

    if (cursor) builder = builder.cursor(cursor);

    try {
        const page = await builder.call();

        const nextCursor = page.records.length > 0 ? page.records.at(-1).paging_token : null;

        return {
            transactions: page.records,
            nextCursor,
        };
    } catch (e) {
        console.error("Error fetching transactions:", e);
        return {transactions: [], nextCursor: null};
    }
}

export async function fetchCandleData(base, quote, resolution = 3600, fromTime = null) {
    const server = getHorizonServer();
    const trades = await server
        .trades()
        .forAssetPair(getAssetParams(base), getAssetParams(quote))
        .limit(200)
        .order("desc")
        .call();

    const all = trades.records.map((t) => ({
        ...t,
        timestamp: Math.floor(new Date(t.ledger_close_time).getTime() / 1000),
    }));

    const filtered = fromTime ? all.filter((t) => t.timestamp <= fromTime) : all;
    return convertToCandles(filtered, resolution);
}

export function convertToCandles(trades, resolution = 3600) {
    const candles = {};

    trades.forEach((trade) => {
        const ts = trade.timestamp;
        const bucket = Math.floor(ts / resolution) * resolution;
        const price = parseFloat(trade.price.n) / parseFloat(trade.price.d);
        const volume = parseFloat(trade.base_amount);

        if (!candles[bucket]) {
            candles[bucket] = {
                time: bucket,
                open: price,
                high: price,
                low: price,
                close: price,
                volume: volume,
            };
        } else {
            candles[bucket].high = Math.max(candles[bucket].high, price);
            candles[bucket].low = Math.min(candles[bucket].low, price);
            candles[bucket].close = price;
            candles[bucket].volume += volume;
        }
    });

    return Object.values(candles).sort((a, b) => a.time - b.time);
}

function getAssetParams(asset) {
    return asset.code === "XLM" ? Asset.native() : new Asset(asset.code, asset.issuer);
}

export function getKeypairFromInput(input) {
    const trimmed = input.trim();

    if (trimmed.startsWith("S") && trimmed.length === 56) {
        return {keypair: Keypair.fromSecret(trimmed), type: "secret"};
    }
    if (validateMnemonic(trimmed)) {
        const seed = mnemonicToSeedSync(trimmed, wordlist);
        const {key} = derivePath("m/44'/148'/0'", seed);
        const kp = Keypair.fromRawEd25519Seed(key);
        return {keypair: kp, type: "mnemonic"};
    }

    throw new Error("Invalid secret key or 24-word phrase");
}

export function generateNewKeypair() {
    const mnemonic = generateMnemonic(wordlist, 256)
    const seed = mnemonicToSeedSync(mnemonic)
    // const { key } = derivePath("m/44'/148'/0'", seed)
    const key = nacl.sign.keyPair.fromSeed(seed)
    const keypair = Keypair.fromRawEd25519Seed(key);
    return {secret: keypair.secret(), publicKey: keypair.publicKey(), mnemonic};
}


export async function swap(from, to, amount, minToReceive, secret, path = [], memo = null) {
    try {
        const server = getHorizonServer();
        const networkPassphrase = getNetworkPassphrase();

        const keypair = Keypair.fromSecret(secret);
        const account = await server.loadAccount(keypair.publicKey());

        const sourceAsset = getAssetParams(from);
        const destAsset = getAssetParams(to);

        const txBuilder = new TransactionBuilder(account, {
            fee: await server.fetchBaseFee(),
            networkPassphrase,
        }).addOperation(
            Operation.pathPaymentStrictSend({
                sendAsset: sourceAsset,
                sendAmount: amount.toString(),
                destination: keypair.publicKey(),
                destAsset,
                destMin: minToReceive.toString(),
                path: path || [],
            })
        );

        if (memo) {
            txBuilder.addMemo(Memo.text(memo));
        }

        const tx = txBuilder.setTimeout(180).build();
        tx.sign(keypair);

        const result = await server.submitTransaction(tx);
        return {ok: true, result};
    } catch (err) {
        console.error("performSwap error:", err);
        return {ok: false, error: err.message};
    }
}

/**
 * Fetch metadata (icons, names, domains, etc.) for your popularTokens in one batch.
 * Automatically picks public vs. testnet URL based on getSelectedNetwork().
 *
 * Example request (public):
 *   https://api.stellar.expert/explorer/public/asset/meta?
 *     asset[]=XLM
 *     &asset[]=USDC-GA5ZSE...
 *
 * @returns {Promise<Object>}  The parsed JSON response, keyed by "ASSET_CODE-ISSUER" (or "XLM").
 */
export async function fetchPopularAssetsMeta() {
    // build correct base URL
    const network = getSelectedNetwork(); // "public" or "testnet"
    const baseURL =
        network === "testnet"
            ? "https://api.stellar.expert/explorer/testnet/asset/meta"
            : "https://api.stellar.expert/explorer/public/asset/meta";

    // assemble query params
    const params = new URLSearchParams();
    for (const t of popularTokens) {
        // for native XLM, just "XLM"
        if (t.code === "XLM") {
            params.append("asset[]", "XLM");
        } else {
            // for credits, use "CODE-ISSUER"
            params.append("asset[]", `${t.code}-${t.issuer}`);
        }
    }

    const url = `${baseURL}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`fetchPopularAssetsMeta failed: ${res.status}`);
    }
    const data = await res.json();
    data._embedded.records.map(asset => {
        const meta = {
            'code': asset.code || asset.toml_info?.code || null,
            'issuer': asset.toml_info?.issuer || null,
            'domain': asset.domain || null,
            'name': asset.toml_info?.name || null,
            'image': asset.toml_info?.image || asset.toml_info?.orgLogo,
        }

        cacheAssetMeta(meta)
    })
    return data._embedded.records;
}

export async function fetchAssetMeta(code, issuer) {

    // const getFromCache = getCachedAssetMeta(code, issuer)
    // if (getFromCache) {
    //     return getFromCache;
    // }

    const network = getSelectedNetwork(); // "public" or "testnet"
    const baseURL =
        network === "testnet"
            ? "https://api.stellar.expert/explorer/testnet/asset/meta"
            : "https://api.stellar.expert/explorer/public/asset/meta";

    // assemble query params
    const params = new URLSearchParams();
    // for native XLM, just "XLM"
    if (code === "XLM") {
        params.append("asset[]", "XLM");
    } else {
        // for credits, use "CODE-ISSUER"
        params.append("asset[]", `${code}-${issuer}`);
    }

    const url = `${baseURL}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`fetchPopularAssetsMeta failed: ${res.status}`);
    }
    const data = await res.json();
    // data._embedded.records.map(asset => {
    //     const meta = {
    //         'code': code,
    //         'issuer': issuer,
    //         'domain': asset.domain || null,
    //         'name': asset.toml_info?.name || null,
    //         'image': asset.toml_info?.image || asset.toml_info?.orgLogo,
    //     }
    //     cacheAssetMeta(meta)
    // })
    return data._embedded.records[0] || null;
}

export async function fetchAssetIcon(code, issuer) {
    const cached = getCachedIcon(code, issuer);
    if (cached) return cached;
    const asset = fetchAssetMeta(code, issuer);
    return asset?.toml_info?.image || asset?.toml_info?.orgLogo || null;
}

export async function fetchAssetInfo(code, issuer) {
    // const cachedIcon = await getCachedIcon(code, issuer);
    // const cachedDomain = await getCachedDomain(code, issuer);
    //
    // if (cachedIcon && cachedDomain) {
    //     return {icon: cachedIcon, domain: cachedDomain};
    // }

    const asset = await fetchAssetMeta(code, issuer);

    return {icon: asset?.toml_info?.image || asset?.toml_info?.orgLogo || null, domain: asset?.domain || null};

}
