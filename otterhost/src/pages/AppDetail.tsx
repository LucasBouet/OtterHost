import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type {
  AppConfig,
  AppContent,
  AppEnv,
  AppPort,
  AppVolume,
} from "../config/apps.config.tsx";
import { apps } from "../config/apps.config.tsx";
import ConfigSection from "../components/ConfigSection.tsx";
import { Button as LoadingButton } from "@/components/ui/stateful-button.tsx";

type Params = {
  appId: string;
};

function AppDetail() {
  const { appId } = useParams<Params>();
  const app: AppConfig | undefined = apps.find(
    (a: AppConfig) => a.id === appId,
  );

  if (!app) {
    return (
      <div className="p-6 flex flex-col h-full items-center justify-center text-slate-400">
        <h1 className="text-3xl font-bold mb-4">App not found</h1>
        <Link
          to="/apps"
          className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
        >
          Back to Apps
        </Link>
      </div>
    );
  }

  if (!app.config) {
    return (
      <div className="p-6 flex flex-col h-full items-center justify-center text-slate-400">
        <h1 className="text-3xl font-bold mb-4">Missing App Configuration</h1>
        <Link
          to="/apps"
          className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
        >
          Back to Apps
        </Link>
      </div>
    );
  }

  const appConfiguration: AppContent = app.config;
  const appConfigurationPort: AppPort = appConfiguration.ports;
  const appConfigurationEnv: AppEnv = appConfiguration.env;
  const appConfigurationVolume: AppVolume = appConfiguration.volumes;

  // React state for editable fields
  const [ports, setPorts] = useState([...appConfigurationPort.port]);
  const [envs, setEnvs] = useState([...appConfigurationEnv.env]);
  const [volumes, setVolumes] = useState([...appConfigurationVolume.path]);
  const [dockerStatusState, setDockerStatusState] = useState<
    "none" | "downloaded" | "running"
  >("none");
  const [loading, setLoading] = useState(false);

  // Send request to the API to build the docker compose
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const downloadToServer = async () => {
    const payload = {
      id: app.id,
      ports: ports,
      env: envs,
      volumes: volumes,
    };

    const response = await fetch("http://localhost:8080/api/docker/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    await delay(2000);

    return data;
  };

  // get the container status
  const fetchDockerStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/docker/status?name=${app.id}`,
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setDockerStatusState(data.status); // "none" | "downloaded" | "running"
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDockerStatus();
  }, []);

  // button click effects
  const handleDockerAction = async () => {
    if (!app) return;
    setLoading(true);

    try {
      if (dockerStatusState === "none") {
        // Download container
        await downloadToServer();
        await fetchDockerStatus();
      } else if (dockerStatusState === "downloaded") {
        // Run container
        await fetch(`http://localhost:8080/api/docker/run`, {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: app.id,
          }),
        });
        await fetchDockerStatus();
      } else if (dockerStatusState === "running") {
        // Stop container
        await fetch(`http://localhost:8080/api/docker/stop`, {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: app.id,
          }),
        });
        await fetchDockerStatus();
      }
    } catch (err) {
      console.error(err);
      alert("Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="max-w-4xl mx-auto w-full">
        {/* Back button */}
        <Link
          to="/apps"
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-slate-800/50 border border-slate-600 rounded-lg hover:bg-slate-700 transition-all text-sm"
        >
          ← Back to Apps
        </Link>

        {/* Hero section */}
        <div className="bg-[#0b1220] border border-slate-700/40 rounded-2xl p-8 mb-8 hover:shadow-[0_0_20px_rgba(148,163,184,0.15)] hover:-translate-y-1 transition-all duration-300 ease-out">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
            <img
              src={app.logo}
              alt={app.title}
              className="w-24 h-24 lg:w-32 lg:h-32 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                {app.title}
              </h1>
              <p className="text-xl text-slate-300 mb-6 leading-relaxed">
                {app.description}
              </p>
              {app.tags && app.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {app.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-slate-700/50 text-sm rounded-full border border-slate-600 text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Config Sections */}
        <ConfigSection
          title="Ports"
          names={appConfigurationPort.name}
          values={ports}
          type="number"
          onChange={(i, value) => {
            const updated = [...ports];
            updated[i] = Number(value);
            setPorts(updated);
          }}
        />

        <ConfigSection
          title="Environment Variables"
          names={appConfigurationEnv.name}
          values={envs}
          onChange={(i, value) => {
            const updated = [...envs];
            updated[i] = value;
            setEnvs(updated);
          }}
        />

        <ConfigSection
          title="Volumes"
          names={appConfigurationVolume.name}
          values={volumes}
          onChange={(i, value) => {
            const updated = [...volumes];
            updated[i] = value;
            setVolumes(updated);
          }}
          autoCompleteApi="http://localhost:8080/api/files"
        />

        {/* Download button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <LoadingButton
            onClick={handleDockerAction}
            disabled={loading}
            className={`cursor-pointer ring-offset-0 w-full sm:w-md px-8 py-4 text-white font-semibold rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-lg flex items-center justify-center
    ${
      loading
        ? "bg-slate-500 cursor-not-allowed"
        : dockerStatusState === "none"
          ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25"
          : dockerStatusState === "downloaded"
            ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/25"
            : "bg-red-600 hover:bg-red-500 shadow-red-500/25"
    }`}
          >
            {loading
              ? "Processing..."
              : dockerStatusState === "none"
                ? "Download to the server"
                : dockerStatusState === "downloaded"
                  ? "Run container"
                  : "Stop container"}
          </LoadingButton>

          <Link
            to="/apps"
            className="w-full  sm:w-md px-8 py-4 bg-slate-700/50 hover:bg-slate-600 border border-slate-600 text-white font-semibold rounded-xl shadow-md hover:shadow-slate-500/25 hover:-translate-y-1 transition-all duration-300 ease-out text-lg flex items-center justify-center"
          >
            ← Back to Apps
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AppDetail;
