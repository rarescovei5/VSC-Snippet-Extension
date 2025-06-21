import { VscClose, VscSearch } from 'react-icons/vsc';

interface TitleSearchbarProps {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
}
const TitleSearchbar = (props: TitleSearchbarProps) => {
  return (
    <div className="!text-text relative flex-1">
      <input
        className="w-full h-full p-3 rounded-sm bg-card border border-border pr-8 outline-none"
        type="text"
        placeholder="Search..."
        value={props.title}
        onChange={(e) => {
          props.setTitle(e.target.value);
        }}
      />
      {!props.title.length ? (
        <VscSearch size={16} className="absolute right-4 top-1/2 -translate-y-1/2" />
      ) : (
        <VscClose
          size={16}
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
          onClick={() => props.setTitle('')}
        />
      )}
    </div>
  );
};

export default TitleSearchbar;
