import { TPrintData } from "./types";

export {};

declare global {
    interface Window {
        MsysWebPosGetPrinterInfo: () => void;
        MsysWebPosPrint: (params: TPrintData | { data: TPrintData }) => void;
        MsysWebPosLogout: () => void;
    }
}