import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/team-settings/team-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash, UserPlus, Mail } from "lucide-react";
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState, FormEvent } from 'react';
import { ResponsiveModal } from '@/components/responsive-modal';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
};

const InviteForm = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { currentTeam, hasPermission } = useAuth();

    // Check if user has permission to invite team members
    const canInvite = hasPermission('invite team members');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!currentTeam) return;

        setIsSubmitting(true);

        router.post(route('team.invites.store', { team: currentTeam.id }), {
            email
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEmail('');
                toast.success('Invitation sent successfully');
            },
            onFinish: () => setIsSubmitting(false)
        });
    };

    if (!canInvite) return null;

    return (
        <div>
            <HeadingSmall
                title="Invite New Member"
            />
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex gap-2">
                        <Input
                            id="email"
                            type="email"
                            placeholder="colleague@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button type="submit" disabled={isSubmitting}>
                            <UserPlus className="size-4 mr-2" />
                            Invite Member
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

const PendingInvites = ({ invites, onRevokeInvite }: { invites: TeamInvite[], onRevokeInvite: (invite: TeamInvite) => void }) => {
    const { hasPermission } = useAuth();
    const canRevokeInvites = hasPermission('revoke team invites');

    if (!invites || invites.length === 0) return null;

    return (
        <div>
            <HeadingSmall
                title="Pending Invitations"
            />
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
                                    <Avatar className="h-8 w-8">
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
                                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
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

export default function TeamMembers() {
    const { members, invites, status } = usePage<SharedData & TeamMembersProps>().props;
    const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
    const [inviteToRevoke, setInviteToRevoke] = useState<TeamInvite | null>(null);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [showRevokeDialog, setShowRevokeDialog] = useState(false);
    const { user, hasPermission, currentTeam } = useAuth();

    // Display a toast message if there's a status
    useState(() => {
        if (status === 'invite-sent') {
            toast.success('Invitation sent successfully');
        } else if (status === 'invite-revoked') {
            toast.success('Invitation revoked successfully');
        } else if (status === 'member-removed') {
            toast.success('Team member removed successfully');
        }
    });

    const handleRemoveMember = (member: Member) => {
        setMemberToRemove(member);
        setShowRemoveDialog(true);
    };

    const confirmRemoveMember = () => {
        if (memberToRemove && currentTeam) {
            router.delete(route('team.members.destroy', {
                team: currentTeam.id,
                user: memberToRemove.id
            }), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRemoveDialog(false);
                    setMemberToRemove(null);
                }
            });
        }
    };

    const handleRevokeInvite = (invite: TeamInvite) => {
        setInviteToRevoke(invite);
        setShowRevokeDialog(true);
    };

    const confirmRevokeInvite = () => {
        if (inviteToRevoke && currentTeam) {
            router.delete(route('team.invites.destroy', {
                team: currentTeam.id,
                teamInvite: inviteToRevoke.id
            }), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRevokeDialog(false);
                    setInviteToRevoke(null);
                    toast.success(`Invitation to ${inviteToRevoke.email} has been revoked`);
                }
            });
        }
    };

    const getRoleBadge = (member: Member) => {
        if (member.roles?.some(role => role.name === 'team admin')) {
            return <Badge className="bg-lime-400/20 text-lime-700 dark:bg-lime-400/10 dark:text-lime-300">Admin</Badge>;
        }
        return <Badge className="bg-sky-400/20 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">Member</Badge>;
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const canRemoveMember = (memberId: number) => {
        return memberId !== user?.id && hasPermission('remove team members');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Members" />

            <SettingsLayout>
                <div className="space-y-12">
                    <div>
                        <HeadingSmall
                            title="Team Members"
                            description="Manage your team members and their roles"
                        />

                        {!members || members.length === 0 ? (
                            <p className="text-neutral-500 mt-4">No members found in this team.</p>
                        ) : (
                            <div className="mt-4">
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
                                                <TableCell>{getRoleBadge(member)}</TableCell>
                                                <TableCell>
                                                    {canRemoveMember(member.id) && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveMember(member)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
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
                        )}
                    </div>

                    {invites && invites.length > 0 && (
                        <PendingInvites invites={invites} onRevokeInvite={handleRevokeInvite} />
                    )}

                    <InviteForm />
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
                    <Button
                        variant="outline"
                        onClick={() => setShowRemoveDialog(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={confirmRemoveMember}
                    >
                        Remove
                    </Button>
                </DialogFooter>
            </ResponsiveModal>

            <ResponsiveModal open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
                <DialogHeader>
                    <DialogTitle>Revoke Invitation</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to revoke the invitation sent to {inviteToRevoke?.email}?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setShowRevokeDialog(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={confirmRevokeInvite}
                    >
                        Revoke
                    </Button>
                </DialogFooter>
            </ResponsiveModal>
        </AppLayout>
    );
}
