export const loadAccount = async (publicKey) => {
    return {
        id: publicKey,
        balances: [
            {
                asset_type: "native",
                balance: "123.456789",
                asset_code: "XLM",
            },
            {
                asset_type: "credit_alphanum4",
                asset_code: "USDC",
                asset_issuer: "GDUKMGUGDZQK6YH5Y...",
                balance: "1000.0000000",
            },
        ],
    };
};

export const sendPayment = async ({
                                      from,
                                      to,
                                      amount,
                                      assetCode,
                                      assetIssuer,
                                      memo,
                                      memoType,
                                  }) => {

    // fake delay
    return new Promise((resolve) =>
        setTimeout(() => resolve({ success: true }), 300)
    );
};
