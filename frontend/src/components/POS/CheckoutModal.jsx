import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useSales } from '@/hooks/useSales';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, CreditCard, Banknote, Smartphone, Wallet, ShoppingBag, CheckCircle2 } from 'lucide-react';
const checkoutSchema = z.object({
  payment_method: z.enum(['cash', 'card', 'mobile', 'other']),
  notes: z.string().optional(),
});
const paymentMethods = [
  { value: 'cash', label: 'Cash', icon: Banknote, gradient: 'from-green-500 to-emerald-600' },
  { value: 'card', label: 'Card/Net Banking', icon: CreditCard, gradient: 'from-blue-500 to-cyan-600' },
  { value: 'mobile', label: 'UPI / Mobile', icon: Smartphone, gradient: 'from-purple-500 to-pink-600' },
  { value: 'other', label: 'Other', icon: Wallet, gradient: 'from-orange-500 to-amber-600' },
];
export function CheckoutModal({ open, onClose, cartItems, subtotal, customer, onComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { createSale } = useSales();
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      payment_method: 'cash',
      notes: '',
    },
  });

  
  const tax = subtotal * 0.18;
  const total = subtotal + tax;
  const onSubmit = async (data) => {
    if (cartItems.length === 0)
      return;
    setIsProcessing(true);
    try {
      
      const sale = await createSale({
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        payment_method: data.payment_method,
        notes: data.notes || null,
        customer: customer 
      });

      toast({
        title: "Sale completed!",
        description: `Invoice processed successfully`,
      });
      form.reset();
      onComplete(sale);
    }
    catch (error) {
      toast({
        title: "Error",
        description: "Failed to process sale. Please try again.",
        variant: "destructive",
      });
    }
    finally {
      setIsProcessing(false);
    }
  };
  return (<Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-w-2xl border-0 bg-gradient-to-br from-background via-background to-primary/5 shadow-2xl backdrop-blur-xl overflow-y-auto max-h-[95vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

      <div className="relative">
        <DialogHeader className="pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-sm">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            Complete Checkout
          </DialogTitle>
          <DialogDescription>
            Review and confirm the payment details for this sale.
          </DialogDescription>
        </DialogHeader>

        {}
        {customer && (<div className="flex items-center gap-4 p-4 mb-5 bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 rounded-xl border-2 border-primary/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/30 to-purple-500/30">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base">{customer.name}</div>
            <div className="text-sm text-muted-foreground">
              {customer.email || customer.phone}
            </div>
          </div>

        </div>)}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {}
            <div className="p-5 bg-gradient-to-br from-muted/80 to-muted/40 backdrop-blur-sm rounded-xl border-2 border-border/50 space-y-3 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between text-sm font-medium">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>GST (18%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>

              <Separator className="my-3" />
              <div className="flex justify-between items-center font-bold text-xl pt-2">
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Total:</span>
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {}
            <FormField control={form.control} name="payment_method" render={({ field }) => (<FormItem className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
              <FormLabel className="text-base font-semibold">Payment Method</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-3 mt-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = field.value === method.value;
                    return (<div key={method.value} className="relative">
                      <RadioGroupItem value={method.value} id={method.value} className="peer sr-only" />
                      <Label htmlFor={method.value} className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${isSelected
                        ? 'border-primary bg-gradient-to-br from-primary/10 to-purple-500/10 shadow-lg shadow-primary/20 scale-[1.02]'
                        : 'border-border bg-background/50 backdrop-blur-sm hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/5 hover:to-purple-500/5 hover:shadow-md hover:scale-[1.01]'}`}>
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${isSelected
                          ? `${method.gradient.replace('from-', 'from-').replace('to-', 'to-')}/20`
                          : 'from-muted to-muted/50'} transition-all duration-300`}>
                          <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'} transition-colors duration-300`} />
                        </div>
                        <span className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-foreground'} transition-colors duration-300`}>
                          {method.label}
                        </span>
                        {isSelected && (<div className="absolute -top-1 -right-1 p-1 rounded-full bg-primary shadow-lg animate-in zoom-in">
                          <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                        </div>)}
                      </Label>
                    </div>);
                  })}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>)} />

            {}
            <FormField control={form.control} name="notes" render={({ field }) => (<FormItem className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
              <FormLabel className="text-base font-semibold">Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Add any notes about this sale..." rows={3} className="resize-none border-2 focus:border-primary transition-all duration-300 bg-background/50 backdrop-blur-sm" />
              </FormControl>
              <FormMessage />
            </FormItem>)} />

            {}
            <div className="flex justify-end gap-3 pt-4 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
              <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing} className="px-6 h-11 border-2 hover:bg-muted/50 transition-all duration-300">
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing || cartItems.length === 0} className="px-8 h-11 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold">
                {isProcessing && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {isProcessing ? 'Processing...' : 'Complete Sale'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DialogContent>
  </Dialog>);
}
