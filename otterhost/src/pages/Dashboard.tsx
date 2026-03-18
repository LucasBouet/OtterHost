import { useEffect, useRef, useState } from "react";
import UsageBar from "../components/UsageBar";
import DashboardButton from "../components/DashboardButton";

interface Metrics {
  ram_current: number;
  ram_max: number;
  cpu_usage: number;
  storage_current: number;
  storage_max: number;
}

function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [apiDown, setApiDown] = useState(false);
  const isFetching = useRef(false);

  const fetchMetrics = async () => {
    if (isFetching.current) return;

    isFetching.current = true;

    try {
      const res = await fetch("http://localhost:8080/api/metrics");

      if (!res.ok) {
        throw new Error("API error");
      }

      const data: Metrics = await res.json();

      setMetrics(data);
      setApiDown(false);
    } catch (err) {
      setApiDown(true);
      setMetrics(null);
    } finally {
      isFetching.current = false;
    }
  };

  useEffect(() => {
    fetchMetrics();

    const interval = setInterval(() => {
      fetchMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (apiDown) {
    return (
      <div>
        <h1 className="text-4xl font-bold">Your dashboard</h1>
        <div className="pt-20 text-red-500 text-xl">
          Monitoring API is unreachable.
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div>
      {/* title */}
      <h1 className="text-4xl font-bold">Your dashboard</h1>

      {/* big part */}
      <div className="pt-20">
        <h2 className="text-2xl font-medium">System Overview</h2>

        {/* buttons */}
        <div className="flex flex-row gap-10 w-full pt-5">
          <div className="flex-1">
            <UsageBar
              title="Memory Usage"
              subtitle="RAM Utilization"
              used={metrics.ram_current}
              total={metrics.ram_max}
              unit="GB"
            />
          </div>

          <div className="flex-1">
            <UsageBar
              title="CPU Usage"
              subtitle="CPU Utilization"
              used={metrics.cpu_usage}
              total={100}
              unit="%"
            />
          </div>

          <div className="flex-1">
            <UsageBar
              title="Storage Usage"
              subtitle="Storage Utilization"
              used={metrics.storage_current}
              total={metrics.storage_max}
              unit="GB"
            />
          </div>
        </div>

        <h2 className="text-2xl font-medium pt-20">Quick shortcuts</h2>

        {/* buttons */}
        <div className="grid grid-cols-4 gap-7 w-full pt-5">
          <DashboardButton
            title="Apps management"
            description="Manage your apps"
            url="/apps"
          />
          <DashboardButton
            title="Web shell"
            description="Execute commands remotely"
            url="/"
          />
          <DashboardButton
            title="File explorer"
            description="Access your files online"
            url="/"
          />
          <DashboardButton
            title="TBD"
            description="TBD"
            url="/"
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
