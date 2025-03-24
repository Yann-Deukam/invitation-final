declare module "react-qr-scanner" {
  import { ComponentType } from "react";

  interface QRScannerProps {
    onScan: (data: string | null) => void;
    onError: (error: any) => void;
    style: React.CSSProperties;
  }

  const QRScanner: ComponentType<QRScannerProps>;
  export default QRScanner;
}
