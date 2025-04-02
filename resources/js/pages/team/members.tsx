import HeadingSmall from '@/components/heading-small';
import { ResponsiveModal } from '@/components/responsive-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/team-settings/team-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ChevronDown, Mail, Trash, UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Team Members',
        href: route('team.edit'),
    },
];

type Role = {
    id: number;
    name: string;
};

type Member = {
    id: number;
    name: string;
    email: string;
    profile_photo_url?: string;
    roles: Role[];
};

type TeamInvite = {
    id: number;
    team_id: number;
    email: string;
    token: string;
    created_at: string;
    updated_at: string;
};

type TeamMembersProps = {
    members: Member[];
    invites: TeamInvite[];
    status?: string;
    team: {
        id: number;
        name: string;
        personal_team: boolean;
    };
};

const InviteForm = () => {
    const { user, hasPermission } = useAuth();

    // Replace useState with useForm for proper error handling
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
    });

    // Check if user has permission to invite team members
    const canInvite = hasPermission('invite team members');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!user?.current_team) return;

        post(route('team.invites.store', { team: user.current_team.id }), {
            preserveScroll: true,
            onSuccess: () => {
                reset('email');
                toast.success('Invitation sent successfully');
            },
        });
    };

    if (!canInvite) return null;

    return (
        <div>
            <HeadingSmall title="Invite New Member" />
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                id="email"
                                type="email"
                                placeholder="colleague@example.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>
                        <Button type="submit" disabled={processing}>
                            <UserPlus className="mr-2 size-4" />
                            Invite Member
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

const PendingInvites = ({ invites, onRevokeInvite }: { invites: TeamInvite[]; onRevokeInvite: (invite: TeamInvite) => void }) => {
    const { hasPermission } = useAuth();
    const canRevokeInvites = hasPermission('revoke team invites');

    if (!invites || invites.length === 0) return null;

    return (
        <div>
            <HeadingSmall title="Pending Invitations" />
            <Table className="mt-4">
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invites.map((invite) => (
                        <TableRow key={invite.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-8">
                                        <AvatarFallback>
                                            <Mail className="size-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>{invite.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>{new Date(invite.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                                {canRevokeInvites && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRevokeInvite(invite)}
                                        className="text-red-500 hover:bg-red-100 hover:text-red-700"
                                    >
                                        <Trash className="size-4" />
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

// Helper function to get the appropriate role badge based on member's roles
const getRoleBadge = (member: Member, currentUserId?: number | null, teamOwnerId?: number | null) => {
    // Check if member is the team owner
    const isTeamOwner = teamOwnerId && member.id === teamOwnerId;

    if (isTeamOwner) {
        return <Badge className="bg-purple-400/20 text-purple-700 dark:bg-purple-400/10 dark:text-purple-300">Team Owner</Badge>;
    } else if (member.roles?.some((role) => role.name === 'team admin')) {
        return <Badge className="bg-lime-400/20 text-lime-700 dark:bg-lime-400/10 dark:text-lime-300">Admin</Badge>;
    } else if (member.roles?.some((role) => role.name === 'uploader')) {
        return <Badge className="bg-sky-400/20 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">Uploader</Badge>;
    }
    return <Badge className="bg-indigo-400/20 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300">Member</Badge>;
};

// Define available roles
const AVAILABLE_ROLES = [
    { key: 'team admin', label: 'Admin' },
    { key: 'team member', label: 'Member' },
    { key: 'uploader', label: 'Uploader' },
];

// Role dropdown component for changing member roles
const RoleDropdown = ({ member, teamId, onRemoveMember }: { member: Member; teamId: number; onRemoveMember: (member: Member) => void }) => {
    const { hasPermission, user } = useAuth();
    const canChangeRole = hasPermission('change member role');
    const canRemove = hasPermission('remove team members') && member.id !== user?.id;
    const isCurrentUser = member.id === user?.id;
    const isTeamOwner = user?.current_team?.user_id === user?.id;
    const isAdmin = member.roles?.some((role) => role.name === 'team admin');

    // Check if this member is the team owner (can't change their role)
    const isMemberTeamOwner = member.id === user?.current_team?.user_id;

    // Get current role name
    const getCurrentRole = () => {
        const role = member.roles?.find((r) => AVAILABLE_ROLES.some((ar) => ar.key === r.name));
        return role?.name || 'team member';
    };

    const currentRole = getCurrentRole();

    // Get display label for role
    const getRoleLabel = (roleName: string) => {
        return AVAILABLE_ROLES.find((r) => r.key === roleName)?.label || 'Member';
    };

    const handleRoleChange = (role: string) => {
        if (role === currentRole) return;

        // Additional check before demoting from admin
        if (isAdmin && role !== 'team admin' && !isTeamOwner) {
            toast.error('Only the team owner can demote administrators');
            return;
        }

        router.patch(
            route('team.members.update', { team: teamId, user: member.id }),
            {
                role: role,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Role for ${member.name} updated to ${getRoleLabel(role)}`);
                },
                onError: (errors) => {
                    toast.error(errors.role || 'Failed to update role');
                },
            },
        );
    };

    // If this is the team owner, or if no permissions at all, just show a static badge
    // If this is the team owner, or if no permissions at all, just show a static badge
    if (isMemberTeamOwner || (!canChangeRole && !canRemove)) {
        return getRoleBadge(member, user?.id, user?.current_team?.user_id);
    }
    // If user can't change admin roles but can remove users, still show dropdown for removal option
    const showRoleOptions = canChangeRole && (isTeamOwner || !isAdmin || isCurrentUser) && !isMemberTeamOwner;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 font-normal">
                    {getRoleBadge(member)}
                    <ChevronDown className="size-3 opacity-70" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {showRoleOptions && (
                    <>
                        <DropdownMenuLabel>Member Role</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={currentRole} onValueChange={handleRoleChange}>
                            {AVAILABLE_ROLES.map((role) => (
                                <DropdownMenuRadioItem key={role.key} value={role.key}>
                                    {role.label}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </>
                )}

                {canRemove && !isMemberTeamOwner && (
                    <>
                        {showRoleOptions && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                            onClick={() => onRemoveMember(member)}
                            className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/20 dark:focus:text-red-300"
                        >
                            <Trash className="h-4 w-4 text-red-500" />
                            Remove from team
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default function TeamMembers() {
    const { members, invites, status, team } = usePage<SharedData & TeamMembersProps>().props;
    const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
    const [inviteToRevoke, setInviteToRevoke] = useState<TeamInvite | null>(null);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [showRevokeDialog, setShowRevokeDialog] = useState(false);
    const { user } = useAuth();

    // Use either the team from props or user.current_team from auth context
    const activeTeam = team || user?.current_team;
    const isPersonalTeam = activeTeam?.personal_team || false;

    // Display a toast message if there's a status
    useState(() => {
        if (status === 'invite-sent') {
            toast.success('Invitation sent successfully');
        } else if (status === 'invite-revoked') {
            toast.success('Invitation revoked successfully');
        } else if (status === 'member-removed') {
            toast.success('Team member removed successfully');
        } else if (status === 'role-updated') {
            toast.success('Team member role updated successfully');
        }
    });

    const handleRemoveMember = (member: Member) => {
        setMemberToRemove(member);
        setShowRemoveDialog(true);
    };

    const confirmRemoveMember = () => {
        if (memberToRemove && user?.current_team) {
            router.delete(
                route('team.members.destroy', {
                    team: user.current_team.id,
                    user: memberToRemove.id,
                }),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setShowRemoveDialog(false);
                        setMemberToRemove(null);
                    },
                },
            );
        }
    };

    const handleRevokeInvite = (invite: TeamInvite) => {
        setInviteToRevoke(invite);
        setShowRevokeDialog(true);
    };

    const confirmRevokeInvite = () => {
        if (inviteToRevoke && user?.current_team) {
            router.delete(
                route('team.invites.destroy', {
                    team: user.current_team.id,
                    teamInvite: inviteToRevoke.id,
                }),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setShowRevokeDialog(false);
                        setInviteToRevoke(null);
                        toast.success(`Invitation to ${inviteToRevoke.email} has been revoked`);
                    },
                },
            );
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Members" />

            <SettingsLayout>
                <div className="space-y-12">
                    <div>
                        <HeadingSmall
                            title={isPersonalTeam ? 'Personal Team' : 'Team Members'}
                            description={
                                isPersonalTeam
                                    ? 'This is your personal team and cannot have additional members.'
                                    : 'Manage your team members and their roles'
                            }
                        />

                        {isPersonalTeam && (
                            <div className="mt-4 rounded-lg border border-sky-100 bg-sky-50 p-4 text-sm text-sky-700 dark:border-sky-200/10 dark:bg-sky-700/10 dark:text-sky-300">
                                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                    <p>
                                        This team was created when you registered and serves as your personal workspace. Your personal team cannot
                                        have additional members.
                                    </p>
                                    <Button
                                        className="bg-linear-to-r/oklch from-indigo-500 to-teal-500 whitespace-nowrap text-white hover:from-indigo-600 hover:to-teal-600"
                                        size="sm"
                                    >
                                        Upgrade to Pro
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className={isPersonalTeam ? 'pointer-events-none relative mt-8' : 'mt-4'}>
                            {!members || members.length === 0 ? (
                                <p className="mt-4 text-neutral-500">No members found in this team.</p>
                            ) : (
                                <div className={isPersonalTeam ? 'opacity-50' : ''}>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Member</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead className="w-[100px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {members.map((member) => (
                                                <TableRow key={member.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={member.profile_photo_url} />
                                                                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                                            </Avatar>
                                                            <span>{member.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{member.email}</TableCell>
                                                    <TableCell>
                                                        {activeTeam && (
                                                            <RoleDropdown
                                                                member={member}
                                                                teamId={activeTeam.id}
                                                                onRemoveMember={handleRemoveMember}
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{/* Remove the delete button from here as it's now in the dropdown */}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {isPersonalTeam && members && members.length > 0 && (
                                <div className="absolute inset-0 rounded-lg bg-white/10 backdrop-blur-[1px] dark:bg-black/10"></div>
                            )}
                        </div>
                    </div>

                    {invites && invites.length > 0 && (
                        <div className={isPersonalTeam ? 'pointer-events-none relative' : ''}>
                            <div className={isPersonalTeam ? 'opacity-50' : ''}>
                                <PendingInvites invites={invites} onRevokeInvite={handleRevokeInvite} />
                            </div>

                            {isPersonalTeam && (
                                <div className="absolute inset-0 -mb-1 rounded-lg bg-white/10 backdrop-blur-[1px] dark:bg-black/10"></div>
                            )}
                        </div>
                    )}

                    <div className={isPersonalTeam ? 'pointer-events-none relative' : ''}>
                        <div className={isPersonalTeam ? 'opacity-50' : ''}>
                            <InviteForm />
                        </div>

                        {isPersonalTeam && <div className="absolute inset-0 -mb-1 rounded-lg bg-white/10 backdrop-blur-[1px] dark:bg-black/10"></div>}
                    </div>
                </div>
            </SettingsLayout>

            <ResponsiveModal open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                <DialogHeader>
                    <DialogTitle>Remove Team Member</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove {memberToRemove?.name} from the team? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={confirmRemoveMember}>
                        Remove
                    </Button>
                </DialogFooter>
            </ResponsiveModal>

            <ResponsiveModal open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
                <DialogHeader>
                    <DialogTitle>Revoke Invitation</DialogTitle>
                    <DialogDescription>Are you sure you want to revoke the invitation sent to {inviteToRevoke?.email}?</DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={confirmRevokeInvite}>
                        Revoke
                    </Button>
                </DialogFooter>
            </ResponsiveModal>
        </AppLayout>
    );
}
