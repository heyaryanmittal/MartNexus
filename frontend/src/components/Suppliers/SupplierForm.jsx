import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSuppliers } from '@/hooks/useSuppliers';
import { supabase } from '@/integrations/supabase/client';
const supplierSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().min(1, 'Code is required').max(10),
    contact_person: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    payment_terms: z.string().optional(),
    notes: z.string().optional(),
    is_active: z.boolean(),
});
export function SupplierForm({ open, supplierId, onClose, onSuccess }) {
    const { createSupplier, updateSupplier } = useSuppliers();
    const isEditing = !!supplierId;
    const form = useForm({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: '',
            code: '',
            contact_person: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            payment_terms: '',
            notes: '',
            is_active: true,
        },
    });
    useEffect(() => {
        if (supplierId && open) {
            supabase
                .from('suppliers')
                .select('*')
                .eq('id', supplierId)
                .single()
                .then(({ data }) => {
                if (data) {
                    form.reset({
                        name: data.name,
                        code: data.code,
                        contact_person: data.contact_person || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        city: data.city || '',
                        payment_terms: data.payment_terms || '',
                        notes: data.notes || '',
                        is_active: data.is_active,
                    });
                }
            });
        }
        else if (!supplierId && open) {
            form.reset({
                name: '',
                code: '',
                contact_person: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                payment_terms: '',
                notes: '',
                is_active: true,
            });
        }
    }, [supplierId, open, form]);
    const onSubmit = async (data) => {
        const supplierData = {
            name: data.name,
            code: data.code,
            is_active: data.is_active,
            contact_person: data.contact_person || null,
            email: data.email || null,
            phone: data.phone || null,
            address: data.address || null,
            city: data.city || null,
            payment_terms: data.payment_terms || null,
            notes: data.notes || null,
        };
        if (isEditing) {
            const success = await updateSupplier(supplierId, supplierData);
            if (success)
                onSuccess();
        }
        else {
            const result = await createSupplier(supplierData);
            if (result)
                onSuccess();
        }
    };
    return (<Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC Supplies" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>

              <FormField control={form.control} name="code" render={({ field }) => (<FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>
            </div>

            <FormField control={form.control} name="contact_person" render={({ field }) => (<FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="supplier@example.com" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>

              <FormField control={form.control} name="phone" render={({ field }) => (<FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 890" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>
            </div>

            <FormField control={form.control} name="address" render={({ field }) => (<FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Supplier Street" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="city" render={({ field }) => (<FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>

              <FormField control={form.control} name="payment_terms" render={({ field }) => (<FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <FormControl>
                      <Input placeholder="Net 30" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>
            </div>

            <FormField control={form.control} name="notes" render={({ field }) => (<FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            <FormField control={form.control} name="is_active" render={({ field }) => (<FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange}/>
                  </FormControl>
                  <FormLabel className="!mt-0">Active Supplier</FormLabel>
                </FormItem>)}/>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Supplier' : 'Create Supplier'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>);
}
