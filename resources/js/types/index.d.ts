import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface Team {
    id: number;
    name: string;
    personal_team: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    teams?: Team[];
    current_team_id?: number;
    current_team?: Team;
    roles?: string[];
    permissions?: string[];
    [key: string]: unknown; // This allows for additional properties...
}

export interface Invoice {
    id: number;
    invoice_number: string;
    invoice_title: string | null; // Added
    sender_company_name: string | null; // Added
    status: string;
    subtotal: number | null; // Added
    tax_rate: number | null; // Added
    tax_amount: number | null; // Added
    total: number;
    invoice_date: string;
    due_date: string;
    currency: string; // Added
    // Add other invoice properties as needed
}
