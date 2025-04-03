import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Check } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Subscription',
        href: '/subscription',
    },
];

// Define the type for plan objects coming from the backend
type Plan = {
    name: string;
    plan_id: string;
    price: string;
};

type Props = {
    plans: Record<string, Plan>;
};

// Define features for each plan
const planFeatures = {
    monthly: ['200 invoices / month', 'Team support (5 users)', 'Export to excel', 'ZIP all invoices'],
    yearly_believer: ['200 invoices / month', 'Team support (5 users)', 'Export to excel', 'ZIP all invoices', '55% OFF!!!', '+ 14 months free'],
};

export default function Dashboard({ plans }: Props) {
    const formatPrice = (price: string) => {
        const numericPrice = parseInt(price);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(numericPrice / 100);
    };

    // Calculate yearly savings compared to monthly
    const calculateYearlySavings = () => {
        if (!plans.monthly || !plans.yearly_believer) return null;

        const monthlyPrice = parseInt(plans.monthly.price);
        const yearlyPrice = parseInt(plans.yearly_believer.price);
        const annualMonthlyTotal = monthlyPrice * 12;
        const savings = annualMonthlyTotal - yearlyPrice;

        return {
            amount: formatPrice(savings.toString()),
            percentage: Math.round((savings / annualMonthlyTotal) * 100),
        };
    };

    const savings = calculateYearlySavings();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mx-auto w-full max-w-5xl py-8">
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Fredger Pro Plans</h1>
                        <p className="text-muted-foreground mt-3">Choose the right plan for your needs</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {Object.entries(plans).map(([key, plan]) => (
                            <Card key={key} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{plan.name}</CardTitle>
                                    <CardDescription>
                                        {key === 'yearly_believer' && savings && (
                                            <div className="text-primary font-medium">
                                                Save {savings.amount} ({savings.percentage}% off)
                                            </div>
                                        )}
                                        {key === 'monthly' && plans.monthly && (
                                            <div className="text-muted-foreground text-sm">
                                                {formatPrice((parseInt(plans.monthly.price) * 12).toString())} per year
                                            </div>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="mb-6 flex items-baseline">
                                        <span className="font-ZZZ text-3xl font-bold">{formatPrice(plan.price)}</span>
                                        <span className="text-muted-foreground ml-2">/{key === 'monthly' ? 'month' : 'year'}</span>
                                    </div>
                                    <ul className="space-y-3">
                                        {planFeatures[key as keyof typeof planFeatures]?.map((feature, i) => (
                                            <li key={i} className="flex items-center">
                                                <Check className="text-primary mr-2 h-5 w-5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className={
                                            key === 'yearly_believer'
                                                ? 'w-full bg-linear-to-r/oklch from-indigo-500 to-teal-500 text-white hover:from-indigo-600 hover:to-teal-600'
                                                : 'w-full'
                                        }
                                        variant={key === 'yearly_believer' ? 'default' : 'outline'}
                                    >
                                        Subscribe
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
