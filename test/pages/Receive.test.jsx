import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MockAppProviders } from "../__mocks__/MockAppProviders.jsx";

import Receive from "../../src/pages/Receive.jsx";

vi.mock("qrcode.react", () => ({
    QRCodeCanvas: () => <div role="img" aria-label="qr-code" />,
}));
describe("Receive Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });


    it("renders QR code and address", async () => {
        render(
            <MockAppProviders>
                <Receive />
            </MockAppProviders>
        );

        expect(await screen.findByText((content) => content.includes("GMOCK"))).toBeInTheDocument();

        // Kiểm tra QRCode được render
        expect(screen.getByRole("img")).toBeInTheDocument();

        // Kiểm tra nút copy
        const copyButton = screen.getByRole("button", { name: /Copy Address/i });

        expect(copyButton).toBeInTheDocument();

        // Giả lập copy clipboard
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn(),
            },
        });

        fireEvent.click(copyButton);

        await waitFor(() => {
            expect(screen.getByText(/Copied!/i)).toBeInTheDocument();
            // expect( screen.findByText((content) => content.includes("Copied"))).toBeInTheDocument();

        });
    });
});
