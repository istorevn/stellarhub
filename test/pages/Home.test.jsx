import { render, screen,waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MockAppProviders } from "../__mocks__/MockAppProviders.jsx";

// ✅ Mock Stellar SDK
vi.mock("../../src/stellar/sdk", async () => {
    const actual = await vi.importActual("../../src/stellar/sdk");
    const mockSdk = await import("../__mocks__/MockStellarSdk.jsx");
    return {
        ...actual,
        ...mockSdk,
    };
});

import Home from "../../src/pages/Home.jsx";

describe("Home Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders wallet info and balances", async () => {
        render(
            <MockAppProviders>
                    <Home />
            </MockAppProviders>
        );

        setTimeout(async ()=>{
            // Check some key components rendered
            expect(await screen.findByText(/Total Balance:/i)).toBeInTheDocument();

            expect(await screen.findByText(/Available:/i)).toBeInTheDocument();
            expect(await screen.findByText(/Trustlines:/i)).toBeInTheDocument();

            // Check token codes
            expect(await screen.findByText('XLM')).toBeInTheDocument();
            expect(await screen.findByText(/USDC/i)).toBeInTheDocument();
        },2000)

    });
});
