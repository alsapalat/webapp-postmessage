import { TPrinterPrintParams } from "./types";

export {};

declare global {
    interface Window {
        // Below just informs IDE and/or TS-compiler (it's set in `.js` file).
        brridgePrinterGetInfo: () => void;
        brridgePrinterPrint: (params: TPrinterPrintParams) => void;
    }
}