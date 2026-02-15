import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerList } from '@/components/Customers/CustomerList';
import { CustomerForm } from '@/components/Customers/CustomerForm';
import { CustomerPricingModal } from '@/components/Customers/CustomerPricingModal';
import { CustomerHistoryModal } from '@/components/Customers/CustomerHistoryModal';
const Customers = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [pricingCustomer, setPricingCustomer] = useState(null);
    const [historyCustomer, setHistoryCustomer] = useState(null);
    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setIsFormOpen(true);
    };
    const handleClose = () => {
        setIsFormOpen(false);
        setEditingCustomer(null);
    };
    return (<div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage customer profiles, pricing, and view purchase history
        </p>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Customer List</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <CustomerList onAdd={() => setIsFormOpen(true)} onEdit={handleEdit} onPricing={setPricingCustomer} onHistory={setHistoryCustomer}/>
        </TabsContent>
      </Tabs>

      <CustomerForm open={isFormOpen} onClose={handleClose} customer={editingCustomer}/>

      <CustomerPricingModal customer={pricingCustomer} onClose={() => setPricingCustomer(null)}/>

      <CustomerHistoryModal customer={historyCustomer} onClose={() => setHistoryCustomer(null)}/>
    </div>);
};
export default Customers;
