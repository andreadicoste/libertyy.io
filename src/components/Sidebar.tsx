import { LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Errore durante il logout');
    } else {
      toast.success('Logout effettuato');
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-[#f2f2f2] border-r border-neutral-200">
      <div className="flex h-16 items-center border-b border-neutral-200 px-6">
        <h1 className="text-xl font-bold text-[#8C00D8] tracking-tight">libertyy.io</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 text-neutral-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-neutral-800 hover:bg-neutral-200 hover:text-neutral-900"
        >
          <LayoutDashboard className="mr-3 h-5 w-5" />
          Dashboard
        </Button>
      </nav>

      <div className="border-t border-neutral-200 p-3">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-neutral-800 hover:bg-neutral-200 hover:text-neutral-900"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
