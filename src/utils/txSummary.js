import {getSelectedNetwork} from "../stellar/sdk";

const BASE_URL =
    getSelectedNetwork() === "testnet"
        ? "https://stellar.expert/explorer/testnet"
        : "https://stellar.expert/explorer/public";

export const shortAddr = (addr, len = 4) => addr ? addr.slice(0, len) + "…" + addr.slice(-1 * len) : '';

export const accountLink = (addr) =>
    `<a href="${BASE_URL}/account/${addr}" target="_blank" class="text-blue-600 hover:underline">${shortAddr(addr)}</a>`;

export const txLink = (tx) => `${BASE_URL}/tx/${tx}`;
export const accountHref = (addr) => `${BASE_URL}/account/${addr}`;
const assetLink = (code = "XLM", issuer = "") =>
    code === "XLM"
        ? `<span class="text-yellow-600 font-semibold">XLM</span>`
        : `<a href="${BASE_URL}/asset/${code}-${issuer}" target="_blank" class="text-blue-600 hover:underline">${code}</a>`;

export function renderOperationSummary(op) {
    switch (op.type) {
        case "payment":
            return `${accountLink(op.from)} sent ${op.amount} ${assetLink(
                op.asset_code,
                op.asset_issuer
            )} to ${accountLink(op.to)}`;

        case "create_account":
            return `${accountLink(op.funder)} created account ${accountLink(
                op.account
            )} with starting balance ${op.starting_balance} ${assetLink("XLM")}`;

        case "account_merge":
            return `${accountLink(op.account)} merged into ${accountLink(op.into)}`;

        case "change_trust":
            return `${accountLink(op.trustor)} ${
                op.limit === "0" ? "removed" : "added"
            } trustline for ${assetLink(op.asset_code, op.asset_issuer)}`;

        case "path_payment_strict_send":
            return `${accountLink(op.from)} swapped ${op.source_amount} ${assetLink(
                op.source_asset_code ? op.source_asset_code : 'XLM',
                op.source_asset_issuer
            )} for ${op.amount} ${assetLink(
                op.asset_code ? op.asset_code : 'XLM',
                op.asset_issuer
            )} to ${accountLink(op.to)}`;

        case "manage_data":
            return `${accountLink(op.source_account)} updated data key "${op.name}"`;

        case "claim_claimable_balance":
            return `${accountLink(op.source_account)} claimed balance ID: ${shortAddr(
                op.balance_id
            )}`;

        case "set_options":
            return `${accountLink(op.source_account)} updated account settings`;

        default:
            return `${accountLink(
                op.source_account || op.account || "unknown"
            )} performed ${op.type}`;
    }
}

