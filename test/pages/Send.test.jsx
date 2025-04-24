import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Send from "../../src/pages/Send.jsx";
import { MockAppProviders } from "../__mocks__/MockAppProviders.jsx";
import {Keypair} from "@stellar/stellar-sdk";

// ✅ Mock Stellar SDK
vi.mock("../../src/stellar/sdk", async () => {
    const actual = await vi.importActual("../../src/stellar/sdk");
    const mockSdk = await import("../__mocks__/MockStellarSdk.jsx");
    return {
        ...actual,
        ...mockSdk,
    };
});

describe("Send Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders form and sends token", async () => {
        render(
            <MockAppProviders>
                <Send />
            </MockAppProviders>
        );

        // Check main heading
        expect(await screen.findByText((content) => content.includes("Send token"))).toBeInTheDocument();


        // Fill recipient address
        const recipientInput = screen.getByPlaceholderText(/Recipient address/i);
        const recipient = Keypair.random().publicKey()
        fireEvent.change(recipientInput, {
            target: { value: recipient },
        });

        // Fill amount
        const amountInput = screen.getByPlaceholderText(/Amount to send/i);

        fireEvent.change(amountInput, { target: { value: "10" } });

        // Click send
        const sendBtn = screen.getByText((content) => content.includes("Send token"));
        fireEvent.click(sendBtn);

        // Wait for success message
        expect(await screen.findByText((content) => content.includes("Transaction sent!"))).toBeInTheDocument();
    });
});
