import { VscCode, VscGear, VscSymbolFile } from 'react-icons/vsc';
import { Link, Outlet } from '../ContextRouter';
import { useRouter } from '../ContextRouter/utilities/useRouter';

const AppLayout = () => {
  const { path } = useRouter();

  return (
    <div className="h-svh flex justify-between bg-background overflow-hidden">
      <aside className="flex flex-col h-full flex-1/4 border-r border-border">
        <div className="flex p-4 border-b border-border gap-2 items-center text-xl font-medium !text-text">
          <VscCode size={16} />
          <h1>Code Snippets</h1>
        </div>
        <div className="flex-1 flex p-1 border-b border-border gap-2 flex-col overflow-y-auto">
          <Link
            to="/settings"
            className={`flex gap-2 items-center rounded-sm border text-base !text-text p-3 ${
              path === '/settings' ? 'bg-card border-border' : 'border-transparent hover:bg-card/50 cursor-pointer'
            }`}
          >
            <VscGear size={16} />
            <span>Settings</span>
          </Link>
          <Link
            to="/"
            className={`flex gap-2 items-center rounded-sm border text-base !text-text p-3 ${
              path === '/' ? 'bg-card border-border' : 'border-transparent hover:bg-card/50 cursor-pointer'
            }`}
          >
            <VscSymbolFile size={16} />
            <span>Snippets</span>
          </Link>
        </div>
        <div className="p-1 !text-text">
          <button className="w-full text-center cursor-pointer text-lg border border-border p-3 rounded-sm">
            New Folder
          </button>
        </div>
      </aside>
      <main className="h-full flex-3/4">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
