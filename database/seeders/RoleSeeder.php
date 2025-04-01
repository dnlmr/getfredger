<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define roles with their permissions
        $roles = [
            'team admin' => [
                'update team',
                'view team members',
                'remove team members',
                'invite team members',
                'revoke team invites',
                'change member role',
                'view own files',
                'upload files',
                'delete files',
                'view all files',
            ],
            'team member' => [
                'view team members',
                'view own files',
                'upload files',
                'delete files',
                'view all files',
            ],
            'uploader' => [
                'upload files',
                'view own files',
            ],
            // Add future roles here with their permissions
        ];

        // Create all unique permissions first
        collect($roles)
            ->flatMap(function ($permissions) {
                return $permissions;
            })
            ->unique()
            ->values()
            ->each(function ($permission) {
                Permission::firstOrCreate(['name' => $permission]);
            });

        // Create roles and assign permissions using collections
        collect($roles)->each(function ($permissions, $role) {
            $roleModel = Role::firstOrCreate(['name' => $role]);
            $roleModel->syncPermissions($permissions);
        });
    }
}
