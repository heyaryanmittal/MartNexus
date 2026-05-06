import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, UserPlus, Percent, Sparkles } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
export const CustomerSelectModal = ({ open, onClose, onSelect, selectedCustomerId, }) => {
  const { customers, isLoading, fetchCustomers } = useCustomers();
  const [search, setSearch] = useState('');
  const [focusedSearch, setFocusedSearch] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open, fetchCustomers]);

  const filteredCustomers = (customers || []).filter((c) => {
    const isActive = c.isActive ?? c.is_active ?? true;
    return isActive && (
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.toLowerCase().includes(search.toLowerCase())
    );
  });
  return (<Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-w-2xl border-0 bg-gradient-to-br from-background via-background to-primary/5 shadow-2xl backdrop-blur-xl overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

      <div className="relative">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-sm">
              <User className="h-6 w-6 text-primary" />
            </div>
            Select Customer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {}
          <div className="relative group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-300 ${focusedSearch ? 'text-primary scale-110' : 'text-muted-foreground'}`} />
            <Input placeholder="Search by name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} onFocus={() => setFocusedSearch(true)} onBlur={() => setFocusedSearch(false)} className={`pl-12 h-12 text-base border-2 transition-all duration-300 bg-background/50 backdrop-blur-sm ${focusedSearch
              ? 'border-primary shadow-lg shadow-primary/20 scale-[1.02]'
              : 'border-border hover:border-primary/50'}`} />
            {focusedSearch && (<div className="absolute inset-0 rounded-lg bg-primary/5 -z-10 blur-xl transition-opacity duration-300" />)}
          </div>

          {}
          <Button variant="outline" className="w-full justify-start h-14 text-base border-2 border-dashed hover:border-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group" onClick={() => onSelect(null)}>
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 mr-3 group-hover:scale-110 transition-transform duration-300">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium">Continue as Walk-in Customer</span>
          </Button>

          {}
          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (<div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4" />
              <p className="text-sm font-medium">Loading customers...</p>
            </div>) : filteredCustomers.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <Search className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium">No customers found</p>
              <p className="text-xs mt-1">Try adjusting your search</p>
            </div>) : (<div className="space-y-3">
              {filteredCustomers.map((customer, index) => (<button key={customer.id} onClick={() => onSelect(customer)} style={{ animationDelay: `${index * 50}ms` }} className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4 ${selectedCustomerId === customer.id
                ? 'border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 shadow-lg shadow-primary/20 scale-[1.02]'
                : 'border-border bg-background/50 backdrop-blur-sm hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/5 hover:to-purple-500/5 hover:shadow-md hover:scale-[1.01]'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-lg transition-all duration-300 ${selectedCustomerId === customer.id
                      ? 'bg-gradient-to-br from-primary/30 to-purple-500/30'
                      : 'bg-gradient-to-br from-primary/10 to-purple-500/10 group-hover:from-primary/20 group-hover:to-purple-500/20'}`}>
                      <User className={`h-5 w-5 transition-colors duration-300 ${selectedCustomerId === customer.id ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base mb-1 truncate group-hover:text-primary transition-colors duration-300">
                        {customer.name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {customer.email || customer.phone || 'No contact info'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {Number(customer.discountPercentage) > 0 && (<Badge variant="secondary" className="text-xs font-semibold bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400 border-green-500/30 hover:scale-105 transition-transform duration-300">
                      <Percent className="h-3 w-3 mr-1" />
                      {customer.discountPercentage}% OFF
                    </Badge>)}
                  </div>
                </div>
              </button>))}
            </div>)}
          </ScrollArea>
        </div>
      </div>
    </DialogContent>
  </Dialog>);
};
