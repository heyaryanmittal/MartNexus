import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
export const BarcodeScanner = ({ open, onClose, onScan }) => {
    const [error, setError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef(null);
    const containerId = 'barcode-scanner-container';
    useEffect(() => {
        if (open && !isScanning) {
            startScanner();
        }
        return () => {
            stopScanner();
        };
    }, [open]);
    const startScanner = async () => {
        try {
            setError(null);
            const html5QrCode = new Html5Qrcode(containerId);
            scannerRef.current = html5QrCode;
            await html5QrCode.start({ facingMode: 'environment' }, {
                fps: 10,
                qrbox: { width: 250, height: 150 },
            }, (decodedText) => {
                onScan(decodedText);
                stopScanner();
                onClose();
            }, () => {
                
            });
            setIsScanning(true);
        }
        catch (err) {
            setError(err.message || 'Failed to start camera');
            setIsScanning(false);
        }
    };
    const stopScanner = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            }
            catch (err) {
                
            }
        }
        scannerRef.current = null;
        setIsScanning(false);
    };
    const handleClose = () => {
        stopScanner();
        onClose();
    };
    return (<Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5"/>
            Scan Barcode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div id={containerId} className="w-full min-h-[300px] bg-muted rounded-lg overflow-hidden"/>

          {error && (<div className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded">
              {error}
              <Button variant="link" size="sm" onClick={startScanner} className="ml-2">
                Retry
              </Button>
            </div>)}

          <p className="text-sm text-muted-foreground text-center">
            Point your camera at a barcode to scan
          </p>

          <Button variant="outline" onClick={handleClose} className="w-full">
            <X className="mr-2 h-4 w-4"/> Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>);
};
