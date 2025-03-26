import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/team-settings/team-layout';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResponsiveModal } from '@/components/responsive-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Team Name',
        href: route('team.edit'),
    },
];

type TeamForm = {
    name: string;
}

export default function TeamName() {
    const { team } = usePage<SharedData & { team: { id: number; name: string; personal_team: boolean } }>().props;
    const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<TeamForm>>({
        name: team.name,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('team.update', team.id), {
            preserveScroll: true,
        });
    };

    const leaveTeam = () => {
        router.post(route('team.leave', team.id), {}, {
            onFinish: () => setConfirmLeaveOpen(false)
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Name" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Team Settings" description="Update your team name" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Team Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                placeholder="Team name"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                {team.personal_team ? (
                    <div className="mt-10 space-y-6">
                        <HeadingSmall
                            title="Personal Team"
                            description="This is your personal team and cannot be left or deleted."
                        />
                        <div className="rounded-lg border border-sky-100 bg-sky-50 p-4 text-sm text-sky-700 dark:border-sky-200/10 dark:bg-sky-700/10 dark:text-sky-100">
                            <p>This team was created when you registered and serves as your personal workspace. Your personal team cannot be left or deleted.</p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-10 space-y-6">
                        <HeadingSmall
                            title="Leave Team"
                            description="Permanently leave this team. This action cannot be undone."
                        />

                        <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                            <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                                <p className="font-medium">Warning</p>
                                <p className="text-sm">Please proceed with caution, this cannot be undone.</p>
                            </div>

                            <Button variant="destructive" onClick={() => setConfirmLeaveOpen(true)}>Leave Team</Button>

                            <ResponsiveModal open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
                                <div className="p-4ZZZ sm:p-6ZZZ">
                                    <DialogHeader>
                                        <DialogTitle>Are you sure you want to leave this team?</DialogTitle>
                                        <DialogDescription>
                                            Once you leave a team, all of your access to this team's resources will be removed.
                                            This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter className="mt-6">
                                        <Button
                                            variant="outline"
                                            onClick={() => setConfirmLeaveOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={leaveTeam}
                                        >
                                            Leave Team
                                        </Button>
                                    </DialogFooter>
                                </div>
                            </ResponsiveModal>
                        </div>
                    </div>
                )}
            </SettingsLayout>
        </AppLayout>
    );
}
