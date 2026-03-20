import NavBar from "./components/NavBar.tsx";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.tsx";
import NotFound from "./pages/404.tsx";
import Apps from "./pages/Apps.tsx";
import AppDetail from "./pages/AppDetail.tsx";
import "./global.css";

function App() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <NavBar />

      {/* Main content */}
      <main className="flex-1 min-h-screen p-6 bg-[#020617] text-white flex flex-col">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/apps/:appId" element={<AppDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
