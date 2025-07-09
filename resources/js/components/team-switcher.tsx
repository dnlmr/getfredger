'use client';
import { ResponsiveModal } from '@/components/responsive-modal';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { SharedData, Team } from '@/types';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ChevronsUpDown, Plus, Settings, User, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AppLogoIcon from './app-logo-icon';

export function TeamSwitcher() {
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const resetMobileNavigation = useMobileNavigation();
    const [showAddTeamModal, setShowAddTeamModal] = useState(false);

    const form = useForm({
        name: '',
    });

    if (!user || !user.teams || user.teams.length === 0) {
        return null;
    }

    const handleTeamChange = (team: Team) => {
        router.patch(
            route('team.current', { team: team.id }),
            {},
            {
                onSuccess: () => {
                    router.flushAll();
                    setTimeout(() => {
                        toast.success(`Switched to team "${team.name}"`);
                    }, 500);
                },
                preserveState: false,
            },
        );
    };

    const handleAddTeam = () => {
        form.post(route('team.store'), {
            onSuccess: () => {
                setShowAddTeamModal(false);
                router.flushAll();
                form.reset();
                // toast.success(`Team "${form.data.name}" created successfully`);
            },
            preserveState: (page) => {
                // Only preserve state if there are validation errors
                return Object.keys(page.props.errors).length > 0;
            },
        });
    };

    const TeamLogo = ({ team }: { team: Team }) => (
        <div className="flex size-6 items-center justify-center rounded-sm">
            {team.personal_team ? <User className="size-4 shrink-0" /> : <Users className="size-4 shrink-0" />}
        </div>
    );

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.current_team?.name || 'Select Team'}</span>
                                    <span className="truncate text-xs">
                                        {user.current_team?.personal_team ? (
                                            'Personal team'
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                {user.current_team?.members_count
                                                    ? `${user.current_team.members_count} member${user.current_team.members_count !== 1 ? 's' : ''}`
                                                    : ''}
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            align="start"
                            side={isMobile ? 'bottom' : state === 'collapsed' ? 'right' : 'bottom'}
                            sideOffset={4}
                        >
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-muted-foreground text-xs">Current Team Settings</DropdownMenuLabel>
                                <DropdownMenuItem className="gap-2 p-2" asChild>
                                    <Link className="block w-full" href={route('team.edit')} as="button" onClick={resetMobileNavigation}>
                                        <div className="flex size-6 items-center justify-center rounded-sm">
                                            <Settings className="size-4 shrink-0" />
                                        </div>
                                        Team Settings
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-muted-foreground text-xs">
                                    Teams {user.teams?.length > 3 ? `(${user.teams.length})` : ''}
                                </DropdownMenuLabel>
                                {user.teams.length > 5 ? (
                                    <ScrollArea className="h-[180px]">
                                        {user.teams.map((team) => (
                                            <DropdownMenuItem key={team.id} onClick={() => handleTeamChange(team)} className="gap-2 p-2">
                                                <TeamLogo team={team} />
                                                {team.name}
                                                {user.current_team?.id === team.id && (
                                                    <span className="ml-auto size-1.5 rounded-full bg-lime-300 dark:bg-lime-600/50"></span>
                                                )}
                                            </DropdownMenuItem>
                                        ))}
                                    </ScrollArea>
                                ) : (
                                    user.teams.map((team) => (
                                        <DropdownMenuItem key={team.id} onClick={() => handleTeamChange(team)} className="gap-2 p-2">
                                            <TeamLogo team={team} />
                                            {team.name}
                                            {user.current_team?.id === team.id && (
                                                <span className="ml-auto size-1.5 rounded-full bg-lime-300 dark:bg-lime-600/50"></span>
                                            )}
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuItem className="gap-2 p-2" onClick={() => setShowAddTeamModal(true)}>
                                    <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                                        <Plus className="size-4" />
                                    </div>
                                    <div className="font-medium">
                                        Add team{' '}
                                        <span className="text-xxs ml-1 rounded-sm bg-linear-to-r/oklch from-indigo-500 to-teal-500 px-1.5 py-0.5 font-mono font-bold text-white">
                                            PRO
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            <ResponsiveModal open={showAddTeamModal} onOpenChange={setShowAddTeamModal}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleAddTeam();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>Create New Team</DialogTitle>
                        <DialogDescription>Add a new team to collaborate with others.</DialogDescription>
                    </DialogHeader>

                    <div className="mt-6 space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="team-name" className="text-sm font-medium">
                                Team Name
                            </label>
                            <Input
                                id="team-name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="Enter team name"
                                className="w-full"
                            />
                            {form.errors.name && <p className="text-destructive mt-1 text-sm">{form.errors.name}</p>}
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowAddTeamModal(false);
                                form.reset();
                            }}
                            disabled={form.processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!form.data.name.trim() || form.processing}>
                            {form.processing ? 'Creating...' : 'Create Team'}
                        </Button>
                    </DialogFooter>
                </form>
            </ResponsiveModal>
        </>
    );
}
