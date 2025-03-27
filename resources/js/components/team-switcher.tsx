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
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { SharedData, Team } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { ChevronsUpDown, Plus, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import AppLogoIcon from './app-logo-icon';

export function TeamSwitcher() {
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const cleanup = useMobileNavigation();
    const [showAddTeamModal, setShowAddTeamModal] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [processing, setProcessing] = useState(false);

    if (!user || !user.teams || user.teams.length === 0) {
        return null;
    }

    const handleTeamChange = (team: Team) => {
        router.patch(
            route('team.current', { team: team.id }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleAddTeam = () => {
        setProcessing(true);
        router.post(
            route('team.store'),
            { name: teamName },
            {
                onSuccess: () => {
                    setShowAddTeamModal(false);
                    setTeamName('');
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                },
                preserveScroll: true,
            },
        );
    };

    const TeamLogo = () => (
        <div className="flex size-6 items-center justify-center rounded-sm">
            <Users className="size-4 shrink-0" />
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
                                    <span className="truncate text-xs">Team</span>
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
                                    <Link className="block w-full" href={route('team.edit')} as="button" onClick={cleanup}>
                                        <div className="flex size-6 items-center justify-center rounded-sm">
                                            <Settings className="size-4 shrink-0" />
                                        </div>
                                        Team Settings
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-muted-foreground text-xs">Teams</DropdownMenuLabel>
                                {user.teams.map((team) => (
                                    <DropdownMenuItem key={team.id} onClick={() => handleTeamChange(team)} className="gap-2 p-2">
                                        <TeamLogo />
                                        {team.name}
                                        {user.current_team?.id === team.id && (
                                            <span className="ml-auto size-1.5 rounded-full bg-lime-300 dark:bg-lime-600/50"></span>
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuItem className="gap-2 p-2" onClick={() => setShowAddTeamModal(true)}>
                                    <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                                        <Plus className="size-4" />
                                    </div>
                                    <div className="font-medium">
                                        Add team{' '}
                                        <span className="text-xxs ml-1 rounded-sm bg-gray-900/50 px-1 py-0.5 font-mono font-bold text-white dark:bg-gray-700/80 dark:text-gray-300">
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
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Enter team name"
                            className="w-full"
                        />
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowAddTeamModal(false);
                            setTeamName('');
                        }}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleAddTeam} disabled={!teamName.trim() || processing}>
                        {processing ? 'Creating...' : 'Create Team'}
                    </Button>
                </DialogFooter>
            </ResponsiveModal>
        </>
    );
}
