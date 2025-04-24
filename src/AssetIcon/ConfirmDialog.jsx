import { Dialog } from "@headlessui/react";

export default function ConfirmDialog({ open, onClose, onConfirm, content }) {
    return (
        <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="flex items-center justify-center min-h-screen">
                <Dialog.Panel className="bg-white p-6 rounded shadow max-w-sm w-full">
                    <Dialog.Title className="text-lg font-semibold mb-4">Confirm transaction</Dialog.Title>
                    <p className="text-sm mb-4">{content}</p>
                    <div className="flex justify-end gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 rounded">
                            ❌ Cancel
                        </button>
                        <button onClick={onConfirm} className="px-4 py-2 text-sm bg-blue-600 text-white rounded">
                            ✅ Confirm
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
