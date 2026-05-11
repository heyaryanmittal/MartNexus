import { LayoutDashboard, Package, Warehouse, ShoppingCart, TrendingUp, Users, FileText, FolderOpen, CreditCard, History, User, Receipt, Database, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, } from "@/components/ui/sidebar";
import { useRoles } from "@/hooks/useRoles";
import { PERMISSIONS } from "@/components/RoleGuard";
const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ['admin', 'manager', 'cashier', 'user'] },
  { title: "POS", url: "/pos", icon: CreditCard, roles: ['admin', 'manager', 'cashier', 'user'] },
  { title: "Products", url: "/products", icon: Package, roles: ['admin', 'manager', 'cashier', 'user'] },
  { title: "Categories", url: "/categories", icon: FolderOpen, roles: ['admin', 'manager', 'user'] },
  { title: "Inventory", url: "/inventory", icon: Warehouse, roles: ['admin', 'manager', 'cashier', 'user'] },
  { title: "Sales", url: "/sales", icon: ShoppingCart, roles: ['admin', 'manager', 'user'] },
  { title: "Invoices", url: "/invoices", icon: Receipt, roles: ['admin', 'manager', 'user'] },
  { title: "Reports", url: "/reports", icon: TrendingUp, roles: ['admin', 'manager', 'user'] },
];
const managementItems = [
  { title: "Suppliers", url: "/suppliers", icon: FileText, roles: ['admin', 'manager', 'user'] },
  { title: "Customers", url: "/customers", icon: Users, roles: ['admin', 'manager', 'cashier', 'user'] },
  { title: "Audit Logs", url: "/audit-logs", icon: History, roles: ['admin', 'manager', 'user'] },
];
export function AppSidebar() {
  const { open } = useSidebar();
  const { hasAnyRole, roles, isLoading } = useRoles();
  const filterByRole = (items) => {
    
    if (roles.length === 0)
      return items;
    return items.filter((item) => !item.roles || hasAnyRole(item.roles));
  };
  const visibleMainItems = filterByRole(mainItems);
  const visibleManagementItems = filterByRole(managementItems);
  return (<Sidebar collapsible="icon">
    <SidebarContent>
      <div className="p-4 border-b flex items-center gap-3">
        <img src="/martnexus.png" alt="MartNexus" className="w-8 h-8 object-contain" />
        <h2 className={`font-bold text-xl text-primary transition-all duration-300 ${!open && "hidden"}`}>
          <span className="text-green-800">M</span>art<span className="text-green-800">N</span>exus
        </h2>
      </div>

      <SidebarGroup>
        <SidebarGroupLabel>Main</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {visibleMainItems.map((item) => (<SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} className="hover:bg-accent" activeClassName="bg-accent text-accent-foreground font-medium">
                  <item.icon className="h-4 w-4" />
                  {open && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {visibleManagementItems.length > 0 && (<SidebarGroup>
        <SidebarGroupLabel>Management</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {visibleManagementItems.map((item) => (<SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} className="hover:bg-accent" activeClassName="bg-accent text-accent-foreground font-medium">
                  <item.icon className="h-4 w-4" />
                  {open && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>)}

      <SidebarGroup>
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/profile" className="hover:bg-accent" activeClassName="bg-accent text-accent-foreground font-medium">
                  <User className="h-4 w-4" />
                  {open && <span>Profile</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/backup-export" className="hover:bg-accent" activeClassName="bg-accent text-accent-foreground font-medium">
                  <Database className="h-4 w-4" />
                  {open && <span>Backup & Export</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>);
}
