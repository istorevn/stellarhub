// test/pages/Swap.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MockAppProviders } from "../__mocks__/MockAppProviders.jsx";

// 1) Mock popularTokens so we control exactly which options appear
vi.mock("../../src/constant/popularToken.js", () => ({
    popularTokens: [
        { code: "AAA", issuer: "III" },
        { code: "BBB", issuer: "JJJ" },
    ],
}));

// 2) Mock Stellar SDK swap functions so they never hit the network
vi.mock("../../src/stellar/sdk", async () => {
    const actual = await vi.importActual("../../src/stellar/sdk");
    return {
        ...actual,
        getSwapRate: vi.fn().mockResolvedValue({
            rate: 1,
            destinationAmount: "1",
            path: [],
        }),
        swap:        vi.fn().mockResolvedValue({ ok: true }),
    };
});

import Swap from "../../src/pages/Swap.jsx";

describe("Swap Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // mock alert so validate() can call it without blowing up
        global.alert = vi.fn();
    });

    it("1. does NOT swap when required fields are missing", async () => {
        render(
            <MockAppProviders>
                <Swap />
            </MockAppProviders>
        );

        // Button starts enabled (only disabled when swapping), but clicking with no amounts
        const swapBtn = screen.getByRole("button", { name: /Perform Swap/i });
        fireEvent.click(swapBtn);

        // Our code should alert and NOT call swap()
        expect(global.alert).toHaveBeenCalledWith("Please fill in all fields.");
        const { swap } = await import("../../src/stellar/sdk");
        expect(swap).not.toHaveBeenCalled();
    });

    it("2. selecting the 'Send' token input updates sendToken", async () => {
        render(
            <MockAppProviders>
                <Swap />
            </MockAppProviders>
        );

        // There are two "Select Token" buttons: [0] for Send, [1] for Receive
        // const [sendBtn] = screen.getAllByRole("button", { name: /Select Token/i });
        const selectButtons = screen.getAllByRole("button", { name: /Select Token/i });
        const sendBtn = selectButtons[0];
        expect(sendBtn).toHaveTextContent("Select Token");

        // Open the modal
        fireEvent.click(sendBtn);
        // expect(await screen.findByText("Select Token")).toBeInTheDocument();
        expect(
            await screen.findByRole("heading", { name: "Select Token" })
        ).toBeInTheDocument();

        // Pick the first mock token "AAA"
        fireEvent.click(screen.getByText("AAA"));

        // The send-button label should now show "AAA"
        await waitFor(() => {
            expect(sendBtn).toHaveTextContent("AAA");
        });
    });

    it("3. selecting the 'Receive' token input updates receiveToken", async () => {
        render(
            <MockAppProviders>
                <Swap />
            </MockAppProviders>
        );

        // Grab both again
        // const [, receiveBtn] = screen.getAllByRole("button", { name: /Select Token/i });
        const selectButtons2 = screen.getAllByRole("button", { name: /Select Token/i });
        const receiveBtn = selectButtons2[1];
        expect(receiveBtn).toHaveTextContent("Select Token");

        // Open its modal
        fireEvent.click(receiveBtn);
        expect(
            await screen.findByRole("heading", { name: "Select Token" })
        ).toBeInTheDocument();
        // expect(await screen.findByText("Select Token")).toBeInTheDocument();

        // Pick the second mock token "BBB"
        fireEvent.click(screen.getByText("BBB"));

        // The receive-button label should now show "BBB"
        await waitFor(() => {
            expect(receiveBtn).toHaveTextContent("BBB");
        });
    });
});
