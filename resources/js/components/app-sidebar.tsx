import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Bell, CreditCard, Folder, LayoutGrid, Tag, UploadCloud } from 'lucide-react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Tags',
        href: '/subscription',
        icon: Tag,
    },
    {
        title: 'Notifications',
        href: '/settings/profile',
        icon: Bell,
    },
    {
        title: 'Upload',
        href: '/settings/appearance',
        icon: UploadCloud,
    },
    {
        title: 'Subscription',
        href: '/subscription',
        icon: CreditCard,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'React Starter Kit',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <TeamSwitcher />
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
