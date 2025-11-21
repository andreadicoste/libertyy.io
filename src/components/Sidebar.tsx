import { UserRound, Globe, Monitor, FileText } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileModal } from '@/components/ProfileModal';
import { useProfile } from '@/hooks/useProfile';

export function Sidebar() {
  const { profile, company, loading, refresh } = useProfile();
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const sitoRoutes = [
    { to: '/sito-web/dashboard', label: 'Dashboard', icon: Monitor },
    { to: '/sito-web/contenuti', label: 'Contenuti', icon: FileText },
  ];
  const isSitoSectionActive = sitePath => location.pathname.startsWith(sitePath);
  const initialOpen = sitoRoutes.some(route => location.pathname.startsWith(route.to));
  const [sitoOpen, setSitoOpen] = useState(initialOpen);

  return (
    <div className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-neutral-200 bg-[#f2f2f2]">
      <div className="flex h-16 items-center px-3">
        <h1 className="text-xl font-bold text-[#8C00D8] tracking-tight">libertyy.io</h1>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4 text-neutral-800">
        <NavLink
          to="/contatti"
          end
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
          activeClassName="bg-white text-neutral-900 shadow-sm"
        >
          <UserRound className="h-5 w-5" />
          Contatti
        </NavLink>
        <div className="space-y-2">          <button
            type="button"
            onClick={() => setSitoOpen(prev => !prev)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition hover:text-neutral-900 ${
              sitoRoutes.some(route => isSitoSectionActive(route.to))
                ? 'text-neutral-900'
                : 'text-neutral-600'
            }`}
          >
            <Globe className="h-5 w-5" />
            <span className="flex-1 text-left">Sito Web</span>
            {sitoOpen ? <ChevronDown className="h-4 w-4 text-neutral-500" /> : <ChevronRight className="h-4 w-4 text-neutral-500" />}
          </button>
          {sitoOpen && (
            <div className="space-y-0 pl-3 border-l-2 border-neutral-200 ml-[21px]">
              {sitoRoutes.map(item => {
                const Icon = item.icon;
                const isActive = isSitoSectionActive(item.to);
                return (
                  <NavLink
                  key={item.to}
                  to={item.to}
                  className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
                    ${
                      isActive
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    } 
                  `}
                  activeClassName=""
                >
                  {item.label}
                </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="border-t border-neutral-200 p-3">
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg border border-transparent bg-white/70 px-3 py-2 text-left transition hover:border-neutral-300"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'Profilo'} className="object-cover"/>
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
            <span className="text-xs text-neutral-500">
              {company?.company_name ? company.company_name.toUpperCase() : 'Gestisci profilo'}
            </span>
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
