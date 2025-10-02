"use client";

import { Users, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { USER_ROLE, ROLE_LABELS, ROLE_DESCRIPTIONS, type UserRole } from '@/constants/roles';

type RoleSelectorProps = {
  value?: UserRole;
  onChange: (role: UserRole) => void;
};

type RoleCardProps = {
  role: UserRole;
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
};

const RoleCard = ({ selected, onClick, icon, title, description }: RoleCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all',
        'hover:border-slate-400 hover:bg-slate-50',
        selected
          ? 'border-slate-900 bg-slate-100'
          : 'border-slate-200 bg-white'
      )}
    >
      <div className={cn(
        'rounded-full p-3',
        selected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
      )}>
        {icon}
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
    </button>
  );
};

export const RoleSelector = ({ value, onChange }: RoleSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <RoleCard
        role={USER_ROLE.INFLUENCER}
        selected={value === USER_ROLE.INFLUENCER}
        onClick={() => onChange(USER_ROLE.INFLUENCER)}
        icon={<Users size={24} />}
        title={ROLE_LABELS[USER_ROLE.INFLUENCER]}
        description={ROLE_DESCRIPTIONS[USER_ROLE.INFLUENCER]}
      />
      <RoleCard
        role={USER_ROLE.ADVERTISER}
        selected={value === USER_ROLE.ADVERTISER}
        onClick={() => onChange(USER_ROLE.ADVERTISER)}
        icon={<Store size={24} />}
        title={ROLE_LABELS[USER_ROLE.ADVERTISER]}
        description={ROLE_DESCRIPTIONS[USER_ROLE.ADVERTISER]}
      />
    </div>
  );
};
