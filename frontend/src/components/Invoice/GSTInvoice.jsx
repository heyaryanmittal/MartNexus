import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, Download, FileText, Building, Phone, Mail, MapPin, Globe } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useShop } from '@/hooks/useShop';

export function GSTInvoice({ open, onClose, sale, shopDetails }) {
  const invoiceRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { shop: fetchedShop } = useShop();

  
  const defaultShopDetails = fetchedShop ? {
    name: fetchedShop.name,
    address: fetchedShop.address || "Address not available",
    city: fetchedShop.city || "-",
    state: fetchedShop.state || "-",
    pincode: fetchedShop.pincode || "-",
    phone: fetchedShop.mobile || "-",
    email: fetchedShop.email || "-",
    gstin: fetchedShop.gstin || "-",
    stateCode: fetchedShop.stateCode || "-"
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

  const shop = shopDetails || defaultShopDetails;

  
  const calculateGST = (amount, rate = 0.18) => {
    const cgst = amount * rate / 2;
    const sgst = amount * rate / 2;
    const igst = amount * rate;
    return { cgst, sgst, igst, total: cgst + sgst };
  };

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-content');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${sale.billNumber}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; }
            .invoice { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .shop-details { margin-bottom: 20px; }
            .billing-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f5f5f5; font-weight: bold; }
            .totals { text-align: right; margin-bottom: 20px; }
            .gst-summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          <div class="invoice">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      
      const addText = (text, x, y, fontSize = 12, isBold = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.text(text, x, y);
        return y + (fontSize * 0.5);
      };

      
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(shop.name, margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('GST INVOICE', margin, yPosition);
      yPosition += 15;

      
      yPosition = addText(`${shop.address}, ${shop.city}`, margin, yPosition, 10);
      yPosition = addText(`${shop.state} - ${shop.pincode}`, margin, yPosition, 10);
      yPosition = addText(`Phone: ${shop.phone}`, margin, yPosition, 10);
      yPosition = addText(`Email: ${shop.email}`, margin, yPosition, 10);
      yPosition = addText(`GSTIN: ${shop.gstin}`, margin, yPosition, 10);
      yPosition += 10;

      
      yPosition = addText(`Invoice #: ${sale.billNumber}`, margin, yPosition, 12, true);
      yPosition = addText(`Date: ${format(new Date(sale.createdAt || new Date()), 'PPP')}`, margin, yPosition, 10);

      if (sale.customerName) {
        yPosition = addText(`Customer: ${sale.customerName}`, margin, yPosition, 10);
      }

      yPosition = addText(`Payment: ${sale.paymentMode?.toUpperCase() || 'CASH'}`, margin, yPosition, 10);
      yPosition += 10;

      
      const tableData = sale.items?.map(item => {
        const productName = item.product?.name || item.name || item.product_name || 'Unknown Product';
        const unitPrice = Number(item.price || item.unit_price || 0);
        const quantity = Number(item.quantity || 0);
        const subtotal = unitPrice * quantity;
        const gst = calculateGST(subtotal);

        return [
          productName,
          quantity.toString(),
          `₹${unitPrice.toFixed(2)}`,
          `₹${subtotal.toFixed(2)}`,
          `₹${gst.cgst.toFixed(2)}`,
          `₹${gst.sgst.toFixed(2)}`,
          `₹${(subtotal + gst.total).toFixed(2)}`
        ];
      }) || [];

      autoTable(pdf, {
        head: [['Item', 'Qty', 'Price', 'Amount', 'CGST', 'SGST', 'Total']],
        body: tableData,
        startY: yPosition,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [66, 66, 66] },
        margin: { left: margin, right: margin }
      });

      yPosition = pdf.lastAutoTable.finalY + 10;

      
      const subtotal = Number(sale.subTotal || (sale.totalAmount - sale.taxAmount));
      const taxAmount = Number(sale.taxAmount);
      const total = Number(sale.totalAmount);

      yPosition = addText(`Subtotal: ₹${subtotal.toFixed(2)}`, pageWidth - 60, yPosition, 10);
      yPosition = addText(`GST (18%): ₹${taxAmount.toFixed(2)}`, pageWidth - 60, yPosition, 10);
      yPosition = addText(`Total: ₹${total.toFixed(2)}`, pageWidth - 60, yPosition, 12, true);
      yPosition += 15;

      
      yPosition = addText('GST Summary:', margin, yPosition, 11, true);
      yPosition = addText(`CGST (9%): ₹${(taxAmount / 2).toFixed(2)}`, margin, yPosition, 10);
      yPosition = addText(`SGST (9%): ₹${(taxAmount / 2).toFixed(2)}`, margin, yPosition, 10);
      yPosition = addText(`Total GST: ₹${taxAmount.toFixed(2)}`, margin, yPosition, 10);

      
      const footerY = pdf.internal.pageSize.getHeight() - 30;
      addText('Thank you for your business!', pageWidth / 2, footerY, 10, false, 'center');
      addText('This is a computer-generated invoice', pageWidth / 2, footerY + 8, 9, false, 'center');

      
      pdf.save(`invoice-${sale.billNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadPDF = () => {
    generatePDF();
  };

  if (!sale) return null;

  const subtotal = Number(sale.subTotal || (sale.totalAmount - sale.taxAmount));
  const taxAmount = Number(sale.taxAmount);
  const total = Number(sale.totalAmount);
  const gstBreakdown = {
    cgst: taxAmount / 2,
    sgst: taxAmount / 2,
    total: taxAmount
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            GST Invoice - {sale.billNumber}
          </DialogTitle>
        </DialogHeader>

        <div id="invoice-content" className="space-y-6" ref={invoiceRef}>
          {}
          <div className="text-center space-y-2 border-b pb-4">
            <h1 className="text-2xl font-bold text-primary">{shop.name}</h1>
            <p className="text-sm text-muted-foreground font-semibold">TAX INVOICE</p>
          </div>

          {}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Shop Details:</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {shop.address}, {shop.city}<br />
                    {shop.state} - {shop.pincode}
                  </p>
                  <div className="flex items-center gap-2 ml-6">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{shop.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{shop.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Invoice Details:</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    <p className="text-sm"><strong>Invoice #:</strong> {sale.billNumber}</p>
                    <p className="text-sm"><strong>Date:</strong> {format(new Date(sale.createdAt || new Date()), 'PPP')}</p>
                    <p className="text-sm"><strong>Payment:</strong> <Badge variant="secondary">{sale.paymentMode?.toUpperCase() || 'CASH'}</Badge></p>
                    {sale.customerName && (
                      <p className="text-sm"><strong>Customer:</strong> {sale.customerName}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>GSTIN:</strong> {shop.gstin}</span>
                  <span className="text-sm text-muted-foreground">|</span>
                  <span className="text-sm"><strong>State Code:</strong> {shop.stateCode}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-3">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 font-medium">Item</th>
                      <th className="text-center p-2 font-medium">Qty</th>
                      <th className="text-right p-2 font-medium">Price</th>
                      <th className="text-right p-2 font-medium">Amount</th>
                      <th className="text-right p-2 font-medium">CGST</th>
                      <th className="text-right p-2 font-medium">SGST</th>
                      <th className="text-right p-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items?.map((item, index) => {
                      const productName = item.product?.name || item.name || item.product_name || 'Unknown Product';
                      const unitPrice = Number(item.price || item.unit_price || 0);
                      const quantity = Number(item.quantity || 0);
                      const itemSubtotal = unitPrice * quantity;
                      const itemGST = calculateGST(itemSubtotal);

                      return (
                        <tr key={index} className="border-b">
                          <td className="p-2">{productName}</td>
                          <td className="text-center p-2">{quantity}</td>
                          <td className="text-right p-2">₹{unitPrice.toFixed(2)}</td>
                          <td className="text-right p-2">₹{itemSubtotal.toFixed(2)}</td>
                          <td className="text-right p-2">₹{itemGST.cgst.toFixed(2)}</td>
                          <td className="text-right p-2">₹{itemGST.sgst.toFixed(2)}</td>
                          <td className="text-right p-2 font-medium">₹{(itemSubtotal + itemGST.total).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-3">GST Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>CGST (9%):</span>
                    <span>₹{gstBreakdown.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (9%):</span>
                    <span>₹{gstBreakdown.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total GST:</span>
                    <span>₹{gstBreakdown.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-primary">
                    <span>Total Amount:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>Thank you for your business!</p>
            <p className="text-xs mt-1">This is a computer-generated invoice</p>
          </div>
        </div>

        {}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
