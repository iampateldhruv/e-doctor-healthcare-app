import { Link, useLocation } from "wouter";
import { User } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [location] = useLocation();
  const { data: user } = useQuery<User>({ 
    queryKey: ['/api/users/current'],
  });

  const { data: notifications } = useQuery({ 
    queryKey: ['/api/notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/notifications?userId=${user.id}`);
      return res.json();
    },
    enabled: !!user?.id
  });

  const unreadNotifications = notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <header className="bg-white shadow fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-primary font-bold text-xl cursor-pointer">E-Doctor</span>
              </Link>
            </div>
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              <NavLink href="/" current={location === "/"}>
                Home
              </NavLink>
              <NavLink href="/doctors" current={location === "/doctors"}>
                Find Doctors
              </NavLink>
              <NavLink href="/pharmacy" current={location === "/pharmacy"}>
                Pharmacy
              </NavLink>
              <NavLink href="/community" current={location === "/community"}>
                Community
              </NavLink>
            </nav>
          </div>
          
          {user ? (
            <div className="hidden md:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  {notifications?.length > 0 ? (
                    notifications.slice(0, 5).map((notification: any) => (
                      <DropdownMenuItem key={notification.id} className="py-3 px-4 cursor-pointer">
                        <div>
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-gray-500">{notification.message}</div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem>No notifications</DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full text-center py-2 text-primary hover:text-primary-600">
                      View all
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="ml-3 relative flex items-center">
                <Link href="/dashboard">
                  <div className="flex items-center cursor-pointer">
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.profileImage || "https://via.placeholder.com/40"}
                      alt="User profile"
                    />
                    <span className="ml-2 text-gray-700">{user.fullName}</span>
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline">Log In</Button>
              <Button>Sign Up</Button>
            </div>
          )}
          
          <div className="-mr-2 flex items-center md:hidden">
            <Button variant="ghost" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  href: string;
  current: boolean;
  children: React.ReactNode;
}

const NavLink = ({ href, current, children }: NavLinkProps) => {
  return (
    <Link href={href}>
      <a
        className={`${
          current
            ? "border-primary text-primary"
            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
      >
        {children}
      </a>
    </Link>
  );
};

export default Header;
