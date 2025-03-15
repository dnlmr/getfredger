"use client"
import * as React from "react"
import { ChevronsUpDown, Plus, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { SharedData, Team } from "@/types"
import { router, usePage } from "@inertiajs/react"
import AppLogoIcon from "./app-logo-icon"
import { useIsMobile } from "@/hooks/use-mobile"

export function TeamSwitcher() {
  const { state } = useSidebar()
  const isMobile = useIsMobile()
  const { auth } = usePage<SharedData>().props
  const user = auth.user

  if (!user || !user.teams || user.teams.length === 0) {
    return null
  }

  const handleTeamChange = (team: Team) => {
    router.patch(route('teams.current', { team: team.id }), {}, {
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
                  <span className="ml-auto text-xs text-muted-foreground">Current</span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
