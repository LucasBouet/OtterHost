type AppProps = {
  title: string;
  description: string;
  logo: string;
  id: string;
  tags?: string[];
  onAppClick?: (id: string) => void;
};

function AppContainer({ title, description, logo, id, tags, onAppClick }: AppProps) {
  const handleClick = () => {
    onAppClick?.(id);
  };

  return (
    <div
      id={id}
      className="bg-[#0b1220]
        border border-slate-700/40
        rounded-xl p-5 text-white w-full flex flex-col
        transition-all duration-300 ease-out
        hover:border-slate-400/60
        hover:shadow-[0_0_20px_rgba(148,163,184,0.15)]
        hover:-translate-y-1
        cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex flex-row gap-3 items-center mb-4">
        <img src={logo} className="w-12 h-12" />
        <p className="font-semibold">{title}</p>
      </div>

      <p className="text-sm text-slate-400">{description}</p>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-slate-700/50 text-xs rounded-full text-slate-300 border border-slate-600">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppContainer;
