import { useState, useEffect, useRef } from 'react';
import { Search, Barcode, Plus, AlertCircle, Camera, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarcodeScanner } from '@/components/Barcode/BarcodeScanner';
import { useBarcodeInput } from '@/hooks/useBarcodeInput';
import { toast } from 'sonner';
export function ProductSearch({ products, onAddToCart }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeMode, setBarcodeMode] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const searchInputRef = useRef(null);
  const lastScannedRef = useRef('');
  const scanTimeoutRef = useRef(null);
  const handleCopyBarcode = (barcode, productName, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(barcode);
    toast.success(`Barcode copied: ${barcode}`, {
      description: `For ${productName}`,
    });
  };
  
  const handleBarcodeScan = (barcode) => {
    const product = products.find((p) => (p.barcode === barcode || p.sku === barcode) && p.is_active);
    if (product) {
      onAddToCart(product.id);
      toast.success(`Added ${product.name} to cart`);
    }
    else {
      toast.error(`Product not found: ${barcode}`);
    }
  };
  useBarcodeInput({
    onScan: handleBarcodeScan,
    enabled: !scannerOpen,
  });
  useEffect(() => {
    searchInputRef.current?.focus();
    
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);
  const filteredProducts = products.filter(product => {
    if (!product.is_active)
      return false;
    const query = searchQuery.toLowerCase();
    return (product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.barcode?.toLowerCase().includes(query));
  });
  const handleBarcodeInput = (value) => {
    setSearchQuery(value);
    
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    
    if (value.length >= 8) {
      const product = products.find(p => p.barcode === value && p.is_active);
      if (product) {
        
        if (lastScannedRef.current === value) {
          return;
        }
        lastScannedRef.current = value;
        onAddToCart(product.id);
        setSearchQuery('');
        searchInputRef.current?.focus();
        
        scanTimeoutRef.current = setTimeout(() => {
          lastScannedRef.current = '';
        }, 1000);
      }
    }
    else {
      
      scanTimeoutRef.current = setTimeout(() => {
        lastScannedRef.current = '';
      }, 500);
    }
  };
  return (<div className="flex flex-col h-full">
    <div className="mb-6 space-y-3">
      <div className="flex gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input ref={searchInputRef} placeholder={barcodeMode ? "Scan or enter barcode..." : "Search products by name, SKU, or barcode..."} value={searchQuery} onChange={(e) => barcodeMode ? handleBarcodeInput(e.target.value) : setSearchQuery(e.target.value)} className="pl-12 h-12 text-base border-2 focus:border-primary/50 transition-all" />
        </div>
        <Button variant={barcodeMode ? "default" : "outline"} size="lg" onClick={() => {
          setBarcodeMode(!barcodeMode);
          setSearchQuery('');
          searchInputRef.current?.focus();
        }} title="Keyboard barcode mode" className="px-4">
          <Barcode className="w-5 h-5" />
        </Button>
        <Button variant="outline" size="lg" onClick={() => setScannerOpen(true)} title="Camera scanner" className="px-4">
          <Camera className="w-5 h-5" />
        </Button>
      </div>

      {barcodeMode && (<div className="flex items-center gap-2 text-sm bg-primary/10 text-primary p-3 rounded-lg border border-primary/20">
        <Barcode className="w-4 h-4" />
        <span className="font-medium">Barcode scanner mode active - use physical scanner or type barcode</span>
      </div>)}
    </div>

    <BarcodeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleBarcodeScan} />

    <ScrollArea className="flex-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
        {filteredProducts.length === 0 ? (<Card className="col-span-full p-16 text-center border-dashed">
          <div className="inline-flex p-4 rounded-full bg-muted mb-4">
            <AlertCircle className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground text-sm">
            {searchQuery ? 'Try a different search term' : 'No active products available'}
          </p>
        </Card>) : (filteredProducts.map((product) => (<Card key={product.id} className="group p-4 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer" onClick={() => onAddToCart(product.id)}>
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1 line-clamp-2 leading-tight">{product.name}</h3>
              <p className="text-xs text-muted-foreground font-mono">SKU: {product.sku}</p>
              {product.barcode && (<div className="flex items-center gap-1.5 mt-1">
                <Barcode className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono">{product.barcode}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-primary/10" onClick={(e) => handleCopyBarcode(product.barcode, product.name, e)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>)}
            </div>
            <Button size="sm" variant="ghost" className="shrink-0 hover:bg-primary hover:text-primary-foreground" onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product.id);
            }}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              ₹{(product.price || product.sellingPrice || product.selling_price || 0).toFixed(2)}
            </span>
            <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"} className="text-xs">
              {product.stock} in stock
            </Badge>
          </div>
        </Card>)))}
      </div>
    </ScrollArea>
  </div>);
}
