import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link } from '@inertiajs/react';
import { Bell, CircleUser, CreditCard, LogOut } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route('subscription.index')} as="button">
                        <span className="text-xxs rounded-sm bg-linear-to-r/oklch from-indigo-500 to-teal-500 px-1.5 py-0.5 font-mono font-bold text-white">
                            PRO
                        </span>
                        Upgrade to Pro
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                        <CircleUser className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                        <CreditCard className="mr-2" />
                        Billing
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                        <Bell className="mr-2" />
                        Notifications
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link className="block w-full" method="post" href={route('logout')} as="button" onClick={cleanup}>
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
