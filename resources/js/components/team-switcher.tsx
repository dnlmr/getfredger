"use client"
import * as React from "react"
import { ChevronsUpDown, Plus, Settings, Users } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { SharedData, Team } from "@/types"
import { Link, router, usePage } from "@inertiajs/react"
import AppLogoIcon from "./app-logo-icon"
import { useIsMobile } from "@/hooks/use-mobile"
import { useMobileNavigation } from "@/hooks/use-mobile-navigation"

export function TeamSwitcher() {
    const { state } = useSidebar()
    const isMobile = useIsMobile()
    const { auth } = usePage<SharedData>().props
    const user = auth.user
    const cleanup = useMobileNavigation();

    if (!user || !user.teams || user.teams.length === 0) {
        return null
    }

    const handleTeamChange = (team: Team) => {
        router.patch(route('team.current', { team: team.id }), {}, {
            preserveScroll: true,
            preserveState: true,
        })
    }

    const TeamLogo = () => (
        <div className="flex size-6 items-center justify-center rounded-sm">
            <Users className="size-4 shrink-0" />
        </div>
    )

    return (
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
                                <span className="truncate font-semibold">
                                    {user.currentTeam?.name || 'Select Team'}
                                </span>
                                <span className="truncate text-xs">Team</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : state === "collapsed" ? "right" : "bottom"}
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Current Team Settings
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                                className="gap-2 p-2"
                                asChild
                            >
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
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Teams
                            </DropdownMenuLabel>
                            {user.teams.map((team) => (
                                <DropdownMenuItem
                                    key={team.id}
                                    onClick={() => handleTeamChange(team)}
                                    className="gap-2 p-2"
                                >
                                    <TeamLogo />
                                    {team.name}
                                    {user.currentTeam?.id === team.id && (
                                        <span className="size-1.5 bg-lime-300 dark:bg-lime-600/50 ml-auto rounded-full"></span>
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem className="gap-2 p-2">
                                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                    <Plus className="size-4" />
                                </div>
                                <div className="font-medium text-muted-foreground">
                                    Add team
                                    <span className="text-xxs ml-1 bg-gray-900/50 py-0.5 px-1 font-mono text-white rounded-sm font-bold dark:text-gray-300 dark:bg-gray-700/80">PRO</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
