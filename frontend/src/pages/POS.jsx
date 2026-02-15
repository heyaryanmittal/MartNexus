import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, User, X, Percent, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductSearch } from '@/components/POS/ProductSearch';
import { Cart } from '@/components/POS/Cart';
import { CheckoutModal } from '@/components/POS/CheckoutModal';
import { ReceiptModal } from '@/components/POS/ReceiptModal';
import { CustomerSelectModal } from '@/components/POS/CustomerSelectModal';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers'; 

export default function POS() {
  const [cartItems, setCartItems] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const { products, fetchProducts } = useProducts();
  const { customers, isLoading, fetchCustomers } = useCustomers(); 

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, [fetchProducts, fetchCustomers]); 

  
  const getEffectivePrice = useCallback((product) => {
    
    const finalPrice = product.price || product.sellingPrice || product.selling_price || 0;
    return { price: finalPrice, hasCustomPrice: false };
  }, []);

  
  useEffect(() => {
    if (cartItems.length > 0) {
      setCartItems(prevItems => prevItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return item;

        
        return item;
      }));
    }
  }, [getEffectivePrice, cartItems.length, products]);
  const addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.is_active)
      return;
    const existingItem = cartItems.find(item => item.productId === productId);
    const { price, hasCustomPrice } = getEffectivePrice(product);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        return;
      }
      setCartItems(cartItems.map(item => item.productId === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item));
    }
    else {
      if (product.stock <= 0)
        return;
      setCartItems([...cartItems, {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        price,
        originalPrice: product.price,
        quantity: 1,
        stock: product.stock,
        hasCustomPrice,
      }]);
    }
    
    if (window.innerWidth < 1024) {
      setActiveTab('cart');
    }
  };
  const updateQuantity = (productId, quantity) => {
    const product = products.find(p => p.id === productId);
    if (!product)
      return;
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    if (quantity > product.stock) {
      return;
    }
    setCartItems(cartItems.map(item => item.productId === productId
      ? { ...item, quantity }
      : item));
  };
  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.productId !== productId));
  };
  const clearCart = () => {
    setCartItems([]);
    setSelectedCustomer(null);
  };
  const handleCheckoutComplete = (sale) => {
    setCompletedSale({ ...sale, customer: selectedCustomer });
    clearCart();
    setIsCheckoutOpen(false);
    fetchProducts();
  };
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setIsCustomerSelectOpen(false);
  };
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const originalSubtotal = cartItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  const customerSavings = originalSubtotal - subtotal;
  return (<div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 lg:gap-6">
    {}
    <div className="lg:hidden flex flex-col h-full">
      <div className="mb-3">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">
          Point of Sale
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Search and add products to cart</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="products" className="relative">
            <Package className="w-4 h-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="cart" className="relative">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart
            {cartItems.length > 0 && (<Badge className="ml-2 h-5 min-w-5 px-1.5" variant="destructive">
              {cartItems.length}
            </Badge>)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="flex-1 mt-0">
          <ProductSearch products={products} onAddToCart={addToCart} />
        </TabsContent>

        <TabsContent value="cart" className="flex-1 mt-0">
          <Card className="flex flex-col h-full shadow-lg">
            {}
            <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
              {selectedCustomer ? (<div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-base">{selectedCustomer.name}</div>
                    {Number(selectedCustomer.discount_percentage) > 0 && (<Badge variant="secondary" className="mt-1">
                      <Percent className="h-3 w-3 mr-1" />
                      {selectedCustomer.discount_percentage}% discount
                    </Badge>)}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)} className="hover:bg-destructive/10 hover:text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              </div>) : (<Button variant="outline" size="lg" className="w-full border-2 border-dashed hover:border-primary hover:bg-primary/5" onClick={() => setIsCustomerSelectOpen(true)}>
                <User className="h-5 w-5 mr-2" />
                Select Customer (Optional)
              </Button>)}
            </div>

            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-lg">Shopping Cart</h2>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </Badge>
              </div>
            </div>

            <Cart items={cartItems} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} onClear={clearCart} subtotal={subtotal} customerSavings={customerSavings} onCheckout={() => setIsCheckoutOpen(true)} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>

    {}
    <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:min-w-0">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">
          Point of Sale
        </h1>
        <p className="text-muted-foreground">Search and add products to cart</p>
      </div>
      <ProductSearch products={products} onAddToCart={addToCart} />
    </div>

    {}
    <Card className="hidden lg:flex lg:w-[420px] lg:flex-col shadow-lg">
      {}
      <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
        {selectedCustomer ? (<div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-base">{selectedCustomer.name}</div>
              {Number(selectedCustomer.discount_percentage) > 0 && (<Badge variant="secondary" className="mt-1">
                <Percent className="h-3 w-3 mr-1" />
                {selectedCustomer.discount_percentage}% discount
              </Badge>)}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)} className="hover:bg-destructive/10 hover:text-destructive">
            <X className="h-4 w-4" />
          </Button>
        </div>) : (<Button variant="outline" size="lg" className="w-full border-2 border-dashed hover:border-primary hover:bg-primary/5" onClick={() => setIsCustomerSelectOpen(true)}>
          <User className="h-5 w-5 mr-2" />
          Select Customer (Optional)
        </Button>)}
      </div>

      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Shopping Cart</h2>
          </div>
          <Badge variant="secondary" className="text-sm">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>
      </div>

      <Cart items={cartItems} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} onClear={clearCart} subtotal={subtotal} customerSavings={customerSavings} onCheckout={() => setIsCheckoutOpen(true)} />
    </Card>

    <CustomerSelectModal open={isCustomerSelectOpen} onClose={() => setIsCustomerSelectOpen(false)} onSelect={handleCustomerSelect} selectedCustomerId={selectedCustomer?.id} />

    <CheckoutModal open={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} cartItems={cartItems} subtotal={subtotal} customerSavings={customerSavings} customer={selectedCustomer} onComplete={handleCheckoutComplete} />

    <ReceiptModal open={!!completedSale} onClose={() => setCompletedSale(null)} sale={completedSale} />
  </div>);
}
