import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/team-settings/team-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

export default function TeamMembers() {
    const { members } = usePage<SharedData & { members: Member[] }>().props;

    const getRoleBadge = (member: Member) => {
        // Check if member has roles
        if (member.roles && member.roles.length > 0) {
            // Find the highest privilege role (owner > admin > member)
            if (member.roles.some(role => role.name === 'team admin')) {
                return <Badge className="bg-lime-400/20 text-lime-700 dark:bg-lime-400/10 dark:text-lime-300">Admin</Badge>;
            } else if (member.roles.some(role => role.name === 'team member')) {
                return <Badge>Member</Badge>;
            }
        }

        // Default fallback
        return <Badge>Member</Badge>;
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Members" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Team Members"
                        description="Manage your team members and their roles"
                    />

                    <div className="space-y-4">
                        {!members || members.length === 0 ? (
                            <p className="text-neutral-500">No members found in this team.</p>
                        ) : (
                            members.map(member => (
                                <Card key={member.id}>
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={member.profile_photo_url} />
                                                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.name}</p>
                                                <p className="text-sm text-neutral-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <div>
                                            {getRoleBadge(member)}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
