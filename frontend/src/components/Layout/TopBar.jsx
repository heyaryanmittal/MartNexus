import { Bell, User, LogOut, Store, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector } from "@/store/hooks";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/store/slices/authSlice";
import { fetchShops, setActiveShop } from "@/store/slices/shopSlice";
import { useEffect, useState } from "react";
import { CreateShopModal } from "@/components/Shops/CreateShopModal";

export function TopBar() {
  const { user } = useAppSelector((state) => state.auth);
  const { shops, activeShop } = useAppSelector((state) => state.shops);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [createShopOpen, setCreateShopOpen] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchShops());
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    dispatch(logout());
    navigate("/auth");
  };

  
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-between">
              <div className="flex items-center truncate">
                <Store className="mr-2 h-4 w-4" />
                <span className="truncate">{activeShop?.name || "Select Shop"}</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]">
            <DropdownMenuLabel>My Shops</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {shops.map((shop) => (
              <DropdownMenuItem key={shop.id} onClick={() => dispatch(setActiveShop(shop))}>
                <Store className="mr-2 h-4 w-4" />
                {shop.name} {activeShop?.id === shop.id && " (Active)"}
              </DropdownMenuItem>
            ))}
            {shops.length === 0 && <DropdownMenuItem disabled>No shops found</DropdownMenuItem>}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setCreateShopOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Shop
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/shops")}>
              <Store className="mr-2 h-4 w-4" />
              Manage Shops
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CreateShopModal open={createShopOpen} onOpenChange={setCreateShopOpen} />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/01.png" alt={user?.name} />
                <AvatarFallback>{getInitials(user?.name || user?.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
