import { UserRound, Globe } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileModal } from '@/components/ProfileModal';
import { useProfile } from '@/hooks/useProfile';

export function Sidebar() {
  const { profile, company, loading, refresh } = useProfile();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-neutral-200 bg-[#f2f2f2]">
      <div className="flex h-16 items-center border-b border-neutral-200 px-6">
        <h1 className="text-xl font-bold text-[#8C00D8] tracking-tight">libertyy.io</h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-neutral-800">
        <NavLink
          to="/contatti"
          end
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-white/70"
          activeClassName="bg-white text-neutral-900 shadow-sm"
        >
          <UserRound className="h-5 w-5" />
          Contatti
        </NavLink>
        <NavLink
          to="/sito-web"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-white/70"
          activeClassName="bg-white text-neutral-900 shadow-sm"
        >
          <Globe className="h-5 w-5" />
          Sito web
        </NavLink>
      </nav>

      <div className="border-t border-neutral-200 p-3">
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg border border-transparent bg-white/70 px-3 py-2 text-left transition hover:border-neutral-300"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'Profilo'} />
            <AvatarFallback>
              {(profile?.full_name || profile?.email || 'P')
                .split(' ')
                .map(part => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-900">
              {profile?.full_name || 'Il tuo profilo'}
            </span>
            <span className="text-xs text-neutral-500">{profile?.email || 'Gestisci profilo'}</span>
          </div>
        </button>
      </div>

      <ProfileModal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        profile={profile}
        company={company}
        refreshProfile={refresh}
      />
    </div>
  );
}
