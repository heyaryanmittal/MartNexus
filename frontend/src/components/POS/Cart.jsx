import { Minus, Plus, X, ShoppingBag, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
export function Cart({ items, onUpdateQuantity, onRemove, onClear, subtotal, customerSavings = 0, onCheckout }) {
    if (items.length === 0) {
        return (<div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="inline-flex p-4 rounded-full bg-muted mb-4">
          <ShoppingBag className="w-16 h-16 text-muted-foreground"/>
        </div>
        <h3 className="font-semibold text-lg mb-2">Cart is empty</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Search and add products to start a sale
        </p>
      </div>);
    }
    return (<>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {items.map((item) => (<div key={item.productId} className="bg-muted/30 rounded-lg p-4 border hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1 line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono">SKU: {item.sku}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive" onClick={() => onRemove(item.productId)}>
                  <X className="w-4 h-4"/>
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}>
                    <Minus className="w-3.5 h-3.5"/>
                  </Button>
                  <span className="w-10 text-center font-semibold">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock}>
                    <Plus className="w-3.5 h-3.5"/>
                  </Button>
                </div>
                <div className="text-right">
                  {item.hasCustomPrice && item.originalPrice !== item.price && (<div className="text-xs text-muted-foreground line-through">
                      ₹{item.originalPrice.toFixed(2)}
                    </div>)}
                  <div className="text-xs text-muted-foreground mb-0.5">
                    ₹{item.price.toFixed(2)} each
                    {item.hasCustomPrice && (<Tag className="inline h-3 w-3 ml-1 text-green-600"/>)}
                  </div>
                  <div className="font-bold text-sm">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-4 bg-muted/20">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Items:</span>
            <span className="font-medium">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          {customerSavings > 0 && (<div className="flex justify-between text-sm font-medium text-green-600 dark:text-green-400">
              <span>Customer Discount:</span>
              <span>-₹{customerSavings.toFixed(2)}</span>
            </div>)}
          <Separator />
          <div className="flex justify-between font-bold text-xl">
            <span>Subtotal:</span>
            <span className="text-primary">₹{subtotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30" size="lg" onClick={onCheckout}>
            Proceed to Checkout
          </Button>
          <Button variant="outline" className="w-full" onClick={onClear}>
            <Trash2 className="w-4 h-4 mr-2"/>
            Clear Cart
          </Button>
        </div>
      </div>
    </>);
}
