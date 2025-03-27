import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function useAuth() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const hasRole = (role: string) => {
        return user?.roles?.includes(role) ?? false;
    };

    const hasPermission = (permission: string) => {
        return user?.permissions?.includes(permission) ?? false;
    };

    const hasAnyRole = (roles: string[]) => {
        return roles.some((role) => hasRole(role));
    };

    const hasAnyPermission = (permissions: string[]) => {
        return permissions.some((permission) => hasPermission(permission));
    };

    const isAdmin = () => hasRole('team admin');

    return {
        user,
        hasRole,
        hasPermission,
        hasAnyRole,
        hasAnyPermission,
        isAdmin,
    };
}
