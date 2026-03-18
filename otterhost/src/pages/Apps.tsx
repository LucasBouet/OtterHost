import { useState, useMemo } from "react";
import AppContainer from "../components/AppContainer";
import { apps } from "../config/apps.config";

function Apps() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showTags, setShowTags] = useState(false);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    apps.forEach((app) => {
      app.tags?.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [apps]);

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch =
        searchTerm === "" ||
        app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => app.tags?.includes(tag));
      return matchesSearch && matchesTags;
    });
  }, [searchTerm, selectedTags]);

  return (
    <div className="p-6 flex flex-col h-full">
      <h1 className="text-4xl font-bold mb-8 shrink-0">Applications management</h1>

      {/* Controls row: Tags dropdown | Search | View toggle */}
      <div className="flex items-center gap-4 mb-8 shrink-0">
        {/* Tags dropdown */}
        <div className="relative flex-none">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
            onClick={() => setShowTags(!showTags)}
          >
            Filter by tags{" "}
            {selectedTags.length > 0 && `(${selectedTags.length})`} ▼
          </button>
          {showTags && (
            <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl z-20 w-56 max-h-64 overflow-y-auto">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  className={`w-full text-left px-4 py-2.5 hover:bg-slate-700/80 transition-all text-sm first:rounded-t-lg last:rounded-b-lg ${
                    selectedTags.includes(tag)
                      ? "bg-blue-500/20 border-r-4 border-blue-400 text-blue-200 font-medium"
                      : "text-slate-300 hover:text-white"
                  }`}
                  onClick={() => {
                    setSelectedTags((prev) =>
                      prev.includes(tag)
                        ? prev.filter((t) => t !== tag)
                        : [...prev, tag],
                    );
                  }}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <div className="border-t border-slate-600 p-2 bg-slate-900/50">
                  <button
                    className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-all"
                    onClick={() => {
                      setSelectedTags([]);
                      setShowTags(false);
                    }}
                  >
                    Clear all ({selectedTags.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className="flex-1 min-w-75">
          <input
            type="text"
            placeholder="Search apps by title or description..."
            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all shadow-sm hover:shadow-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* View toggle */}
        <div className="flex gap-1 flex-none">
          <button
            className={`p-2.5 rounded-lg transition-all shadow-md ${
              viewMode === "grid"
                ? "bg-emerald-600/90 text-white shadow-emerald-500/25 hover:bg-emerald-500"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-600 border border-slate-600 hover:shadow-slate-500/25"
            }`}
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            <svg
              className="w-4.5 h-4.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 5.6C14 5.03995 14 4.75992 14.109 4.54601C14.2049 4.35785 14.3578 4.20487 14.546 4.10899C14.7599 4 15.0399 4 15.6 4H18.4C18.9601 4 19.2401 4 19.454 4.10899C19.6422 4.20487 19.7951 4.35785 19.891 4.54601C20 4.75992 20 5.03995 20 5.6V8.4C20 8.96005 20 9.24008 19.891 9.45399C19.7951 9.64215 19.6422 9.79513 19.454 9.89101C19.2401 10 18.9601 10 18.4 10H15.6C15.0399 10 14.7599 10 14.546 9.89101C14.3578 9.79513 14.2049 9.64215 14.109 9.45399C14 9.24008 14 8.96005 14 8.4V5.6Z"
                stroke="#FFFFFF"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M4 5.6C4 5.03995 4 4.75992 4.10899 4.54601C4.20487 4.35785 4.35785 4.20487 4.54601 4.10899C4.75992 4 5.03995 4 5.6 4H8.4C8.96005 4 9.24008 4 9.45399 4.10899C9.64215 4.20487 9.79513 4.35785 9.89101 4.54601C10 4.75992 10 5.03995 10 5.6V8.4C10 8.96005 10 9.24008 9.89101 9.45399C9.79513 9.64215 9.64215 9.79513 9.45399 9.89101C9.24008 10 8.96005 10 8.4 10H5.6C5.03995 10 4.75992 10 4.54601 9.89101C4.35785 9.79513 4.20487 9.64215 4.10899 9.45399C4 9.24008 4 8.96005 4 8.4V5.6Z"
                stroke="#FFFFFF"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M4 15.6C4 15.0399 4 14.7599 4.10899 14.546C4.20487 14.3578 4.35785 14.2049 4.54601 14.109C4.75992 14 5.03995 14 5.6 14H8.4C8.96005 14 9.24008 14 9.45399 14.109C9.64215 14.2049 9.79513 14.3578 9.89101 14.546C10 14.7599 10 15.0399 10 15.6V18.4C10 18.9601 10 19.2401 9.89101 19.454C9.79513 19.6422 9.64215 19.7951 9.45399 19.891C9.24008 20 8.96005 20 8.4 20H5.6C5.03995 20 4.75992 20 4.54601 19.891C4.35785 19.7951 4.20487 19.6422 4.10899 19.454C4 19.2401 4 18.9601 4 18.4V15.6Z"
                stroke="#FFFFFF"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M14 15.6C14 15.0399 14 14.7599 14.109 14.546C14.2049 14.3578 14.3578 14.2049 14.546 14.109C14.7599 14 15.0399 14 15.6 14H18.4C18.9601 14 19.2401 14 19.454 14.109C19.6422 14.2049 19.7951 14.3578 19.891 14.546C20 14.7599 20 15.0399 20 15.6V18.4C20 18.9601 20 19.2401 19.891 19.454C19.7951 19.6422 19.6422 19.7951 19.454 19.891C19.2401 20 18.9601 20 18.4 20H15.6C15.0399 20 14.7599 20 14.546 19.891C14.3578 19.7951 14.2049 19.6422 14.109 19.454C14 19.2401 14 18.9601 14 18.4V15.6Z"
                stroke="#FFFFFF"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            className={`p-2.5 rounded-lg transition-all shadow-md ${
              viewMode === "list"
                ? "bg-indigo-600/90 text-white shadow-indigo-500/25 hover:bg-indigo-500"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-600 border border-slate-600 hover:shadow-slate-500/25"
            }`}
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <svg
              className="w-4.5 h-4.5"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 1H1V3H3V1Z" fill="#FFFFFF" />
              <path d="M3 5H1V7H3V5Z" fill="#FFFFFF" />
              <path d="M1 9H3V11H1V9Z" fill="#FFFFFF" />
              <path d="M3 13H1V15H3V13Z" fill="#FFFFFF" />
              <path d="M15 1H5V3H15V1Z" fill="#FFFFFF" />
              <path d="M15 5H5V7H15V5Z" fill="#FFFFFF" />
              <path d="M5 9H15V11H5V9Z" fill="#FFFFFF" />
              <path d="M15 13H5V15H15V13Z" fill="#FFFFFF" />
            </svg>
          </button>
        </div>
      </div>

      {/* Apps */}
      <div className="flex-1 overflow-y-auto">
        <div
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {filteredApps.map((app) => (
            <AppContainer
              key={app.id}
              title={app.title}
              description={app.description}
              logo={app.logo}
              id={app.id}
              tags={app.tags}
            />
          ))}
          {filteredApps.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
              <div className="text-6xl">🔍</div>
              <p className="text-xl">No apps found</p>
              <p className="text-sm opacity-75">
                Try adjusting your search or tag filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Apps;
