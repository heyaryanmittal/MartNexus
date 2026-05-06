import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/store/hooks";
import { fetchShops, deleteShop, updateShop } from "@/store/slices/shopSlice";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Store, Trash2, Edit, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MyShops() {
    const { shops, loading } = useAppSelector((state) => state.shops);
    const dispatch = useDispatch();
    const { toast } = useToast();

    const [editShop, setEditShop] = useState(null); 
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [shopToDelete, setShopToDelete] = useState(null);
    const [formData, setFormData] = useState({ name: "", address: "", mobile: "", gstin: "" });

    useEffect(() => {
        dispatch(fetchShops());
    }, [dispatch]);

    const handleDelete = (shop) => {
        setShopToDelete(shop);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (shopToDelete) {
            try {
                await dispatch(deleteShop(shopToDelete.id)).unwrap();
                toast({
                    title: "Shop Deleted Successfully",
                    description: "Shop and all related data have been deleted."
                });
                setDeleteDialogOpen(false);
                setShopToDelete(null);
            } catch (error) {
                console.error('Delete shop error:', error);
                const errorMessage = error.details || error.message || "Failed to delete shop";
                toast({
                    title: "Error Deleting Shop",
                    description: errorMessage,
                    variant: "destructive",
                    duration: 10000
                });
                setDeleteDialogOpen(false);
                setShopToDelete(null);
            }
        }
    };

    const handleEditClick = (shop) => {
        setEditShop(shop);
        setFormData({ name: shop.name, address: shop.address || "", mobile: shop.mobile || "", gstin: shop.gstin || "" });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateShop({ id: editShop.id, data: formData })).unwrap();
            toast({ title: "Shop Updated" });
            setEditShop(null);
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold tracking-tight">My Shops</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.map((shop) => (
                    <Card key={shop.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5" /> {shop.name}
                            </CardTitle>
                            <CardDescription>Created: {new Date(shop.createdAt || Date.now()).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">Address: {shop.address || 'N/A'}</p>
                            <p className="text-sm text-gray-500">Mobile: {shop.mobile || 'N/A'}</p>
                            <p className="text-sm text-gray-500">GSTIN: {shop.gstin || 'N/A'}</p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(shop)}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(shop)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                {shops.length === 0 && !loading && (
                    <p className="text-gray-500">No shops found. Create one from the top bar.</p>
                )}
            </div>

            <Dialog open={!!editShop} onOpenChange={(open) => !open && setEditShop(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Shop</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="address" className="text-right">Address</Label>
                            <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="mobile" className="text-right">Mobile</Label>
                            <Input id="mobile" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="gstin" className="text-right">GSTIN</Label>
                            <Input id="gstin" value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} className="col-span-3" />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Update Shop</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="sm:max-w-[500px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-3 text-2xl">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                            Delete Shop
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4 pt-2">
                            <div className="text-base">
                                Are you sure you want to delete <strong className="text-foreground text-lg">{shopToDelete?.name}</strong>?
                            </div>

                            <div className="bg-destructive/10 border-2 border-destructive/50 rounded-lg p-4 space-y-2">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-base font-semibold text-destructive">
                                            ⚠️ WARNING: This action cannot be undone!
                                        </p>
                                        <p className="text-sm text-foreground">
                                            The shop and <strong className="text-destructive">ALL related data</strong> will be permanently deleted, including:
                                        </p>
                                        <ul className="text-sm text-foreground list-disc list-inside space-y-0.5 ml-2">
                                            <li>All products and inventory</li>
                                            <li>All bills and invoices</li>
                                            <li>All customers and suppliers</li>
                                            <li>All purchase orders</li>
                                            <li>All categories and pricing</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setDeleteDialogOpen(false);
                            setShopToDelete(null);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Shop & All Data
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
