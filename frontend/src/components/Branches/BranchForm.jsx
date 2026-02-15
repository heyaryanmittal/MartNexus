import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useBranches } from '@/hooks/useBranches';
import { supabase } from '@/integrations/supabase/client';
const branchSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().min(1, 'Code is required').max(10, 'Code must be 10 characters or less'),
    address: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    is_active: z.boolean(),
    is_main: z.boolean(),
});
export function BranchForm({ open, branchId, onClose, onSuccess }) {
    const { createBranch, updateBranch } = useBranches();
    const isEditing = !!branchId;
    const form = useForm({
        resolver: zodResolver(branchSchema),
        defaultValues: {
            name: '',
            code: '',
            address: '',
            city: '',
            phone: '',
            email: '',
            is_active: true,
            is_main: false,
        },
    });
    useEffect(() => {
        if (branchId && open) {
            
            supabase
                .from('branches')
                .select('*')
                .eq('id', branchId)
                .single()
                .then(({ data }) => {
                if (data) {
                    form.reset({
                        name: data.name,
                        code: data.code,
                        address: data.address || '',
                        city: data.city || '',
                        phone: data.phone || '',
                        email: data.email || '',
                        is_active: data.is_active,
                        is_main: data.is_main,
                    });
                }
            });
        }
        else if (!branchId && open) {
            form.reset({
                name: '',
                code: '',
                address: '',
                city: '',
                phone: '',
                email: '',
                is_active: true,
                is_main: false,
            });
        }
    }, [branchId, open, form]);
    const onSubmit = async (data) => {
        const branchData = {
            name: data.name,
            code: data.code,
            is_active: data.is_active,
            is_main: data.is_main,
            address: data.address || null,
            city: data.city || null,
            phone: data.phone || null,
            email: data.email || null,
        };
        if (isEditing) {
            const success = await updateBranch(branchId, branchData);
            if (success)
                onSuccess();
        }
        else {
            const result = await createBranch(branchData);
            if (result)
                onSuccess();
        }
    };
    return (<Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem>
                    <FormLabel>Branch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Store" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>

              <FormField control={form.control} name="code" render={({ field }) => (<FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="MAIN" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>
            </div>

            <FormField control={form.control} name="address" render={({ field }) => (<FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street" {...field}/>
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

              <FormField control={form.control} name="phone" render={({ field }) => (<FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 890" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>)}/>
            </div>

            <FormField control={form.control} name="email" render={({ field }) => (<FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="branch@example.com" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            <div className="flex gap-6">
              <FormField control={form.control} name="is_active" render={({ field }) => (<FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange}/>
                    </FormControl>
                    <FormLabel className="!mt-0">Active</FormLabel>
                  </FormItem>)}/>

              <FormField control={form.control} name="is_main" render={({ field }) => (<FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange}/>
                    </FormControl>
                    <FormLabel className="!mt-0">Main Branch</FormLabel>
                  </FormItem>)}/>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Branch' : 'Create Branch'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>);
}
