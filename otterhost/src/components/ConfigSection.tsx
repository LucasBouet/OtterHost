import { useState, useRef, useEffect } from "react";

function ConfigSection({
  title,
  names,
  values,
  onChange,
  type = "text",
  autoCompleteApi,
}: {
  title: string;
  names: string[];
  values: (string | number)[];
  onChange: (index: number, value: string) => void;
  type?: string;
  autoCompleteApi?: string;
}) {
  const [suggestions, setSuggestions] = useState<string[][]>(
    names.map(() => []),
  );
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (index: number, query: string) => {
    if (!autoCompleteApi) return;

    const pathQuery = query.trim() === "" ? "/" : query;
    if (!query.endsWith("/")) return;

    try {
      const res = await fetch(
        `${autoCompleteApi}?path=${encodeURIComponent(pathQuery)}`,
      );
      if (!res.ok) {
        setSuggestions((prev) => {
          const copy = [...prev];
          copy[index] = [];
          return copy;
        });
        setOpenIndex(null);
        return;
      }

      const data: { path: string; is_dir: boolean }[] = await res.json();
      const dirs = data.filter((f) => f.is_dir).map((f) => f.path);

      setSuggestions((prev) => {
        const copy = [...prev];
        copy[index] = dirs;
        return copy;
      });

      setOpenIndex(dirs.length > 0 ? index : null);
    } catch {
      setSuggestions((prev) => {
        const copy = [...prev];
        copy[index] = [];
        return copy;
      });
      setOpenIndex(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#0b1220] border border-slate-700 rounded-xl p-6 mb-6"
    >
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      <div className="flex flex-col gap-4">
        {names.map((name, i) => (
          <div key={i} className="flex flex-col gap-1 relative">
            <label className="text-sm text-slate-400">{name}</label>
            <input
              type={type}
              value={values[i]}
              onChange={(e) => {
                onChange(i, e.target.value);
                fetchSuggestions(i, e.target.value);
              }}
              onFocus={() =>
                values[i] && fetchSuggestions(i, values[i].toString())
              }
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
              autoComplete="off"
            />

            {openIndex === i && suggestions[i] && suggestions[i].length > 0 && (
              <ul className="absolute top-full left-0 mt-1 z-10 max-h-40 w-full overflow-auto bg-slate-800 border border-slate-600 rounded-lg shadow-lg">
                {suggestions[i].map((sug) => (
                  <li
                    key={sug}
                    className="px-3 py-1 hover:bg-slate-700 cursor-pointer text-white text-sm"
                    onClick={() => {
                      onChange(i, sug);
                      setOpenIndex(null);
                    }}
                  >
                    {sug}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConfigSection;
