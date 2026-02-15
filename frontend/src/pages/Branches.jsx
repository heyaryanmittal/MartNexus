import { useState, useEffect } from 'react';
import { Plus, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BranchList } from '@/components/Branches/BranchList';
import { BranchForm } from '@/components/Branches/BranchForm';
import { StockTransferList } from '@/components/Branches/StockTransferList';
import { StockTransferForm } from '@/components/Branches/StockTransferForm';
import { BranchInventoryView } from '@/components/Branches/BranchInventoryView';
import { useBranches } from '@/hooks/useBranches';
export default function Branches() {
    const [isBranchFormOpen, setIsBranchFormOpen] = useState(false);
    const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const { branches, transfers, fetchBranches, fetchTransfers } = useBranches();
    useEffect(() => {
        fetchBranches();
        fetchTransfers();
    }, []);
    return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Branch Management</h1>
          <p className="text-muted-foreground">
            Manage locations, inventory, and stock transfers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsTransferFormOpen(true)}>
            <ArrowLeftRight className="w-4 h-4 mr-2"/>
            New Transfer
          </Button>
          <Button onClick={() => setIsBranchFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2"/>
            Add Branch
          </Button>
        </div>
      </div>

      <Tabs defaultValue="branches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="branches">Branches ({branches.length})</TabsTrigger>
          <TabsTrigger value="inventory">Branch Inventory</TabsTrigger>
          <TabsTrigger value="transfers">
            Stock Transfers ({transfers.filter(t => t.status === 'pending').length} pending)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branches">
          <BranchList branches={branches} onEdit={(id) => {
            setEditingBranch(id);
            setIsBranchFormOpen(true);
        }} onRefresh={fetchBranches}/>
        </TabsContent>

        <TabsContent value="inventory">
          <BranchInventoryView branches={branches}/>
        </TabsContent>

        <TabsContent value="transfers">
          <StockTransferList transfers={transfers} onRefresh={fetchTransfers}/>
        </TabsContent>
      </Tabs>

      <BranchForm open={isBranchFormOpen} branchId={editingBranch} onClose={() => {
            setIsBranchFormOpen(false);
            setEditingBranch(null);
        }} onSuccess={() => {
            setIsBranchFormOpen(false);
            setEditingBranch(null);
            fetchBranches();
        }}/>

      <StockTransferForm open={isTransferFormOpen} branches={branches} onClose={() => setIsTransferFormOpen(false)} onSuccess={() => {
            setIsTransferFormOpen(false);
            fetchTransfers();
        }}/>
    </div>);
}
