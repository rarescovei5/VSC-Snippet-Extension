import { VscCode, VscFiles, VscGear } from 'react-icons/vsc';
import { Link, Outlet } from '../ContextRouter';
import { useRouter } from '../ContextRouter/utilities/useRouter';

const AppLayout = () => {
  const { path } = useRouter();

  return (
    <div className="h-svh flex justify-between">
      <aside className="flex flex-col h-full flex-1/4 border-r">
        <div className="flex p-2 border-b gap-2 items-center text-xl font-medium">
          <VscCode size={16} />
          <h1>Code Snippets</h1>
        </div>
        <div className="flex-1 flex p-2 border-b gap-2 flex-col">
          <Link to="/settings" className="flex gap-2 items-center cursor-pointer">
            <VscGear size={16} />
            Settings
          </Link>
          <Link to="/" className="flex gap-2 items-center cursor-pointer">
            <VscFiles size={16} />
            Snippets
          </Link>
        </div>
        <div className="p-2">
          <button className="w-full text-center cursor-pointer">New Folder</button>
        </div>
      </aside>
      <main className="h-full flex-3/4">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
