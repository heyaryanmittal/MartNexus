import { useState } from 'react';
import { Edit, Trash2, MapPin, Building2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { useBranches } from '@/hooks/useBranches';
export function BranchList({ branches, onEdit, onRefresh }) {
    const [deleteId, setDeleteId] = useState(null);
    const { deleteBranch } = useBranches();
    const handleDelete = async () => {
        if (deleteId) {
            const success = await deleteBranch(deleteId);
            if (success) {
                onRefresh();
            }
            setDeleteId(null);
        }
    };
    if (branches.length === 0) {
        return (<Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground mb-4"/>
          <h3 className="text-lg font-semibold mb-2">No branches yet</h3>
          <p className="text-muted-foreground text-center">
            Add your first branch to start managing multi-location inventory.
          </p>
        </CardContent>
      </Card>);
    }
    return (<>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => (<Card key={branch.id} className="relative">
            {branch.is_main && (<div className="absolute top-3 right-3">
                <Badge variant="default" className="flex items-center gap-1">
                  <Star className="w-3 h-3"/>
                  Main
                </Badge>
              </div>)}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5"/>
                {branch.name}
              </CardTitle>
              <Badge variant={branch.is_active ? 'secondary' : 'outline'}>
                {branch.code}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {branch.address && (<div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0"/>
                  <span>
                    {branch.address}
                    {branch.city && `, ${branch.city}`}
                  </span>
                </div>)}
              {branch.phone && (<p className="text-sm text-muted-foreground">📞 {branch.phone}</p>)}
              {branch.email && (<p className="text-sm text-muted-foreground">✉️ {branch.email}</p>)}
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(branch.id)}>
                  <Edit className="w-4 h-4 mr-1"/>
                  Edit
                </Button>
                {!branch.is_main && (<Button variant="outline" size="sm" onClick={() => setDeleteId(branch.id)}>
                    <Trash2 className="w-4 h-4"/>
                  </Button>)}
              </div>
            </CardContent>
          </Card>))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this branch? This will also remove all associated inventory records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>);
}
