import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GSTInvoice } from '@/components/Invoice/GSTInvoice';
import { FileText, Eye } from 'lucide-react';
import { useShop } from '@/hooks/useShop';

export function ReceiptModal({ open, onClose, sale }) {
  const [showGSTInvoice, setShowGSTInvoice] = useState(false);
  const { shop, loading: shopLoading } = useShop();

  if (!sale) return null;

  const handleViewGSTInvoice = () => {
    setShowGSTInvoice(true);
  };

  const handleCloseGSTInvoice = () => {
    setShowGSTInvoice(false);
  };

  const shopDetails = shop ? {
    name: shop.name,
    address: shop.address || "Address not available",
    city: shop.city || "City", 
    state: shop.state || "State", 
    pincode: shop.pincode || "000000",
    phone: shop.mobile || "Phone not available",
    email: shop.email || "Email not available", 
    gstin: shop.gstin || "GSTIN not available",
    stateCode: shop.stateCode || "27"
  } : {
    name: "MartNexus Store",
    address: "Please configure shop details",
    city: "-",
    state: "-",
    pincode: "-",
    phone: "-",
    email: "-",
    gstin: "-",
    stateCode: "-"
  };

  return (
    <>
      <Dialog open={open && !showGSTInvoice} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sale Completed
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-600">✓ Payment Successful</div>
              <p className="text-lg font-semibold">Invoice #{sale.billNumber}</p>
              <p className="text-muted-foreground">Total Amount: ₹{Number(sale.totalAmount).toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Payment Method:</span>
                <span className="capitalize font-medium">{sale.paymentMode}</span>
              </div>
              {sale.customerName && (
                <div className="flex justify-between text-sm">
                  <span>Customer:</span>
                  <span className="font-medium">{sale.customerName}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Items:</span>
                <span className="font-medium">{sale.items?.length || 0}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={handleViewGSTInvoice}>
                <Eye className="w-4 h-4 mr-2" />
                View Invoice
              </Button>
              <Button className="flex-1" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <GSTInvoice
        open={showGSTInvoice}
        onClose={handleCloseGSTInvoice}
        sale={sale}
        shopDetails={shopDetails}
      />
    </>
  );
}
