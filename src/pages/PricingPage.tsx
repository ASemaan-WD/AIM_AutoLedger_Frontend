import { type FC, Fragment } from 'react';
import {
  CheckCircle,
  HelpCircle,
  LayersThree01,
  LayersTwo01,
  Minus,
  Zap,
} from '@untitledui/icons';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { cx } from '@/utils/cx';

type Tier = {
  name: string;
  canChatToSales?: boolean;
  highlighted?: boolean;
  badge?: string;
  href?: string;
  priceMonthly: number | string;
  description: string;
  icon?: FC;
};

const tiers: Tier[] = [
  {
    name: 'Basic',
    href: '#',
    priceMonthly: 50,
    description: 'Perfect for small businesses and freelancers.',
    icon: Zap,
  },
  {
    name: 'Advanced',
    highlighted: true,
    href: '#',
    priceMonthly: 800,
    description: 'For mid-market businesses with high volume.',
    icon: LayersTwo01,
  },
  {
    name: 'Enterprise',
    href: '#',
    priceMonthly: 'Custom',
    description: 'Tailored solutions for large organizations.',
    icon: LayersThree01,
    canChatToSales: true,
  },
];

type Section = {
  name: string;
  features: {
    name: string;
    tooltip: { title: string; description: string };
    tiers: Record<string, boolean | string>;
  }[];
};

const sections2: Section[] = [
  {
    name: 'Overview',
    features: [
      {
        name: 'Document processing',
        tooltip: {
          title: 'Monthly document processing limit',
          description: 'Number of documents you can process each month with your plan.',
        },
        tiers: {
          Basic: '50 invoices',
          Advanced: '500 invoices/PO/other',
          Enterprise: 'Unlimited',
        },
      },
      {
        name: 'AP Bookkeeping',
        tooltip: {
          title: 'Accounts Payable management',
          description: 'Complete accounts payable bookkeeping and management features.',
        },
        tiers: {
          Basic: true,
          Advanced: true,
          Enterprise: true,
        },
      },
      {
        name: 'Bank reconciliation',
        tooltip: {
          title: 'Automated bank reconciliation',
          description: 'Match transactions automatically and streamline your reconciliation process.',
        },
        tiers: {
          Basic: 'Basic',
          Advanced: 'Advanced',
          Enterprise: 'Advanced',
        },
      },
      {
        name: 'GL coding',
        tooltip: {
          title: 'General Ledger coding',
          description: 'Automated and manual general ledger account coding for all transactions.',
        },
        tiers: {
          Basic: true,
          Advanced: true,
          Enterprise: true,
        },
      },
      {
        name: 'Support',
        tooltip: {
          title: 'Customer support access',
          description: 'Access to customer support and training resources.',
        },
        tiers: {
          Basic: 'Email support',
          Advanced: 'Priority support',
          Enterprise: 'Dedicated account manager',
        },
      },
    ],
  },
  // ... other sections omitted for brevity, copy from original file
];

export default function PricingPage() {
  return (
    <section className="overflow-hidden bg-primary">
      <div className="mx-auto max-w-container px-4 py-16 md:px-8 md:py-24">
        <div className="flex w-full max-w-3xl flex-col">
          <span className="text-sm font-semibold text-brand-secondary md:text-md">Pricing</span>
        </div>
      </div>

      <div className="w-full py-16 md:px-8 md:py-24 lg:mx-auto lg:max-w-container">
        {/* xs to lg */}
        <div className="space-y-16 lg:hidden">
          {tiers.map((tier) => (
            <section key={tier.name}>
              <div className="mb-8 flex flex-col px-4">
                <FeaturedIcon icon={tier.icon} color="gray" theme="modern" size="md" />
                <p key={tier.name} className="mt-5 flex items-center gap-2 text-xl font-semibold text-brand-secondary">
                  {tier.name} plan
                  {tier.badge && (
                    <Badge size="md" type="pill-color" color="brand">
                      {tier.badge}
                    </Badge>
                  )}
                </p>
                <p className="mt-2 text-display-md font-semibold text-primary">
                  {typeof tier.priceMonthly === 'number' ? `$${tier.priceMonthly}/mth` : tier.priceMonthly}
                </p>
                <p className="mt-2 text-md text-tertiary">{tier.description}</p>
                <div className="mt-8 flex flex-col gap-3">
                  <Button size="xl">{tier.name === 'Enterprise' ? 'Contact us' : 'Free trial'}</Button>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* lg+ - Simplified version */}
        <div className="max-lg:hidden">
          <div className="grid grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div key={tier.name} className="flex flex-col items-center p-6">
                <FeaturedIcon icon={tier.icon} color="gray" theme="modern" size="md" />
                <p className="mt-5 text-xl font-semibold text-brand-secondary">{tier.name} plan</p>
                <p className="mt-2 text-display-lg font-semibold text-primary">
                  {typeof tier.priceMonthly === 'number' ? `$${tier.priceMonthly}/mth` : tier.priceMonthly}
                </p>
                <p className="mt-2 text-md text-tertiary">{tier.description}</p>
                <div className="mt-8 w-full">
                  <Button size="xl">{tier.name === 'Enterprise' ? 'Contact us' : 'Free trial'}</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

