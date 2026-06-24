'use client';

import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';
import { FLAME } from '@/lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const SIZE_CLASS = {
  sm: 'size-8 text-[11px] rounded-full',
  md: 'size-10 text-[12px] rounded-full',
  lg: 'size-14 text-lg rounded-2xl',
  xl: 'size-16 text-lg rounded-2xl',
  '2xl': 'size-24 text-2xl rounded-3xl',
} as const;

type UserAvatarProps = {
  src?: string | null;
  name?: string | null;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
};

export function UserAvatar({ src, name, size = 'md', className }: UserAvatarProps) {
  const initials = getInitials(name || 'User');

  return (
    <Avatar className={cn(SIZE_CLASS[size], className)}>
      {src ? <AvatarImage src={src} alt={name || 'Profile photo'} /> : null}
      <AvatarFallback
        className="font-black text-white"
        style={{ background: `linear-gradient(135deg, ${FLAME}, #FF9B6A)` }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
