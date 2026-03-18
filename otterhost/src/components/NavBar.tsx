import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";

function NavBar() {
  return (
    <aside className="w-64 h-100% bg-[#0f172b] border-slate-700/50 text-white flex flex-col pt-5">
      <Link to="/" className="justify-center flex flex-row items-center text-2xl font-bold gap-2">
        <img src={Logo} className="w-12 h-12 object-contain" alt="Logo" />
        <span>OtterHost</span>
      </Link>

      <nav className="flex flex-col mt-4">
        <Link to="/" className="px-4 py-2 hover:bg-gray-700 rounded">
          Dashboard
        </Link>
        <Link to="/about" className="px-4 py-2 hover:bg-gray-700 rounded">
          About
        </Link>
        <Link to="/settings" className="px-4 py-2 hover:bg-gray-700 rounded">
          Settings
        </Link>
      </nav>
    </aside>
  );
}

export default NavBar;