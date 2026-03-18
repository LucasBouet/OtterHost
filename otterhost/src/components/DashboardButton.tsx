import { Link } from "react-router-dom";

type DashboardButtonProps = {
  title: string;
  description: string;
  url: string;
};

function DashboardButton({ title, description, url }: DashboardButtonProps) {
  return (
    <Link
      to={url}
      className="
        bg-[#0b1220]
        border border-slate-700/40
        rounded-xl p-5 text-white w-full flex flex-col

        transition-all duration-300 ease-out
        hover:border-slate-400/60
        hover:shadow-[0_0_20px_rgba(148,163,184,0.15)]
        hover:-translate-y-1

        cursor-pointer
      "
    >
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-slate-400 pt-3">{description}</p>
    </Link>
  );
}

export default DashboardButton;
