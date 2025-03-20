<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Spatie\Permission\Models\Permission;

class AdminRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $role = Role::firstOrCreate(['name' => 'team admin']);


        $role->givePermissionTo(Permission::firstOrCreate(['name' => 'update team']));
        $role->givePermissionTo(Permission::firstOrCreate(['name' => 'view team members']));
        $role->givePermissionTo(Permission::firstOrCreate(['name' => 'remove team members']));
        $role->givePermissionTo(Permission::firstOrCreate(['name' => 'invite team members']));
        $role->givePermissionTo(Permission::firstOrCreate(['name' => 'revoke team invites']));

    }
}
