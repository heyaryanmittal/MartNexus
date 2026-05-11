import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GSTInvoice } from './GSTInvoice';
import { useToast } from '@/hooks/use-toast';
import { Search, FileText, Calendar, Download, Eye, Printer } from 'lucide-react';
import { useSales } from '@/hooks/useSales';
import { useShop } from '@/hooks/useShop';
import { format } from 'date-fns';

export function InvoiceManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const { sales: invoices, loading: isLoading } = useSales();
  const { toast } = useToast();

  const { shop } = useShop();

  const shopDetails = shop ? {
    name: shop.name,
    address: shop.address || "Address not available",
    city: "-", 
    state: "-", 
    pincode: "-", 
    phone: shop.mobile || "-",
    email: "-", 
    gstin: shop.gstin || "-",
    stateCode: "-"
  } : null;

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleReprintInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleDownloadInvoice = async (invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const filteredInvoices = (invoices || []).filter(invoice =>
    invoice.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.paymentMode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return 'Invalid Date';
    }
  };

  const getPaymentModeDisplay = (mode) => {
    const displayMap = {
      'CASH': 'Cash',
      'NET_BANKING': 'Card/Bank',
      'UPI': 'UPI/Mobile'
    };
    return displayMap[mode] || mode;
  };

  const getPaymentBadgeVariant = (mode) => {
    const variants = {
      'CASH': 'default',
      'NET_BANKING': 'secondary',
      'UPI': 'outline',
      'OTHER': 'destructive'
    };
    return variants[mode] || 'default';
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Invoice Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">View, print, and download your invoices</p>
        </div>
        <Badge variant="outline" className="text-sm w-fit">
          {(invoices || []).length} Total Invoices
        </Badge>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice number, customer name, or payment method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-5 w-5" />
            Recent Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No invoices found matching your search.' : 'No invoices yet.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-semibold text-base sm:text-lg">#{invoice.billNumber}</span>
                        <Badge variant={getPaymentBadgeVariant(invoice.paymentMode)}>
                          {getPaymentModeDisplay(invoice.paymentMode)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span className="truncate">{formatDate(invoice.createdAt)}</span>
                        </div>
                        <div className="truncate">
                          Customer: <span className="font-medium text-foreground">{invoice.customerName}</span>
                        </div>
                        <div>
                          Items: <span className="font-medium text-foreground">{invoice.items?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold">₹{Number(invoice.totalAmount).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">incl. GST ₹{Number(invoice.taxAmount).toFixed(2)}</div>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReprintInvoice(invoice)}
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Reprint
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Modal */}
      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <GSTInvoice
          open={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          sale={selectedInvoice}
          shopDetails={shopDetails}
        />
      </Dialog>
    </div>
  );
}
