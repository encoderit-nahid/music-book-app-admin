import { LogOut } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@/axios";
import Loading from "./base/loading";

export function NavUser() {
  const { data: user, isLoading } = useCurrentUser();
  const navigate = useNavigate();
  const [isDialogOpen, setDialogOpen] = useState(false);


  if (isLoading || !user) return <Loading />;

  const fullName = `${user.name}`.trim();

  const initials =
    `${user.name?.[0] ?? ""}`.toUpperCase();

  function handelLogOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete api.defaults.headers.common["Authorization"];

    navigate({ to: "/login", replace: true });
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="size-8 rounded-full">
                <AvatarFallback className="rounded-full">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg ml-2"
              side="bottom"
              align="end"
              sideOffset={4}
            >
              {/* Profile Info */}
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-full">
                    <AvatarFallback className="rounded-full">
                      {initials || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {fullName || "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDialogOpen(true)}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Confirm Logout Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to log out?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>

            <Button
              variant="destructive"
              className="min-w-24 hover:bg-destructive/90 flex items-center gap-2"
              onClick={handelLogOut}
            >
              Log out
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
