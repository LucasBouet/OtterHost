export type AppConfig = {
  title: string;
  description: string;
  logo: string;
  id: string;
  tags: string[];
  config?: AppContent;
};

export type AppContent = {
  ports: AppPort;
  env: AppEnv;
  volumes: AppVolume;
};

export type AppEnv = {
  name: string[];
  env: string[];
};

export type AppVolume = {
  name: string[];
  path: string[];
};

export type AppPort = {
  name: string[];
  port: number[];
};

export const apps: AppConfig[] = [
  {
    title: "Nextcloud",
    description:
      "A self-hosted personal cloud platform that allows you to store, sync, and share files, manage your calendar and contacts, and collaborate with others securely.",
    logo: "/logos/nextcloud.svg",
    id: "nextcloud",
    tags: ["cloud", "storage", "collaboration"],
  },
  {
    title: "Jellyfin",
    description:
      "An open-source media server that lets you organize, manage, and stream your personal video, audio, and TV collection to any device without relying on third-party services.",
    logo: "/logos/jellyfin.svg",
    id: "jellyfin",
    tags: ["media", "streaming", "video"],
    config: {
      ports: {
        name: ["Jellyfin port", "Server discovery port (do not edit)"],
        port: [8096, 7359],
      },
      env: {
        name: ["Server's URL"],
        env: ["https://jellyfin.website.com"],
      },
      volumes: {
        name: ["Configuration folder", "Cache folder", "Media Folder"],
        path: ["/path/to/config", "/path/to/cache", "/path/to/media"],
      },
    },
  },
  {
    title: "Plex",
    description:
      "A media streaming solution that organizes your personal media libraries and enables streaming across devices, including some proprietary features for enhanced experience.",
    logo: "/logos/plex.svg",
    id: "plex",
    tags: ["media", "streaming", "video"],
  },
  {
    title: "Immich",
    description:
      "A self-hosted alternative to Google Photos designed to automatically back up, organize, and manage your photos and videos, with optional AI-powered features.",
    logo: "/logos/immich.svg",
    id: "immich",
    tags: ["photos", "backup", "ai"],
  },
  {
    title: "Vaultwarden",
    description:
      "A lightweight, self-hosted password manager compatible with Bitwarden clients, offering secure password storage, two-factor authentication, and cross-device access.",
    logo: "/logos/vaultwarden.svg",
    id: "vaultwarden",
    tags: ["security", "password", "auth"],
  },
  {
    title: "Gitea",
    description:
      "A lightweight Git server solution providing repository hosting, code review, issue tracking, and continuous integration capabilities for developers.",
    logo: "/logos/gitea.svg",
    id: "gitea",
    tags: ["git", "dev", "code"],
  },
  {
    title: "Forgejo",
    description:
      "A community-driven fork of Gitea focused on open governance, providing the same lightweight Git hosting, collaboration tools, and project management features.",
    logo: "/logos/forgejo.svg",
    id: "forgejo",
    tags: ["git", "dev", "code"],
  },
  {
    title: "Home Assistant",
    description:
      "A powerful home automation platform that enables you to control smart devices, create automation rules, and monitor your home from a single interface.",
    logo: "/logos/homeassistant.svg",
    id: "homeassistant",
    tags: ["iot", "automation", "home"],
  },
  {
    title: "AdGuard Home",
    description:
      "A network-wide DNS server that blocks advertisements, trackers, and malicious domains, providing enhanced privacy and faster browsing for all connected devices.",
    logo: "/logos/adguard.svg",
    id: "adguard",
    tags: ["network", "dns", "privacy"],
  },
  {
    title: "Pi-hole",
    description:
      "A network-level ad blocker that filters unwanted content from all devices on your network, helping to improve privacy, security, and browsing performance.",
    logo: "/logos/pihole.svg",
    id: "pihole",
    tags: ["network", "dns", "privacy"],
  },
  {
    title: "Portainer",
    description:
      "A web-based interface for managing Docker environments, allowing you to deploy, monitor, and maintain containers, images, networks, and volumes with ease.",
    logo: "/logos/portainer.svg",
    id: "portainer",
    tags: ["docker", "management", "infra"],
  },
  {
    title: "Uptime Kuma",
    description:
      "A simple self-hosted monitoring solution that tracks the availability of websites, services, and servers, sending alerts when downtime or issues are detected.",
    logo: "/logos/uptimekuma.svg",
    id: "uptimekuma",
    tags: ["monitoring", "uptime", "alerts"],
  },
  {
    title: "Grafana",
    description:
      "A visualization and analytics platform for metrics collected from various sources, allowing you to create dashboards, alerts, and perform deep analysis of system performance.",
    logo: "/logos/grafana.svg",
    id: "grafana",
    tags: ["monitoring", "metrics", "dashboard"],
  },
  {
    title: "Prometheus",
    description:
      "A powerful open-source monitoring and alerting toolkit that collects and stores metrics, enabling analysis and visualization of system and application performance.",
    logo: "/logos/prometheus.svg",
    id: "prometheus",
    tags: ["monitoring", "metrics", "backend"],
  },
  {
    title: "Syncthing",
    description:
      "A peer-to-peer file synchronization tool that automatically syncs files between devices securely without relying on a central server.",
    logo: "/logos/syncthing.svg",
    id: "syncthing",
    tags: ["sync", "files", "p2p"],
  },
  {
    title: "Transmission",
    description:
      "A lightweight BitTorrent client that allows efficient downloading and uploading of files, offering a simple interface and minimal system resource usage.",
    logo: "/logos/transmission.svg",
    id: "transmission",
    tags: ["torrent", "download", "p2p"],
  },
  {
    title: "qBittorrent",
    description:
      "A feature-rich torrent client with a web interface, enabling easy downloading, seeding, and management of torrent files across multiple platforms.",
    logo: "/logos/qbittorrent.svg",
    id: "qbittorrent",
    tags: ["torrent", "download", "p2p"],
  },
  {
    title: "BookStack",
    description:
      "A simple, self-hosted wiki platform for creating, organizing, and sharing documentation or knowledge bases within teams or for personal use.",
    logo: "/logos/bookstack.svg",
    id: "bookstack",
    tags: ["wiki", "docs", "knowledge"],
  },
  {
    title: "Outline",
    description:
      "A modern collaborative wiki platform that allows teams to document knowledge, share resources, and manage projects in a structured and accessible way.",
    logo: "/logos/outline.svg",
    id: "outline",
    tags: ["wiki", "docs", "collaboration"],
  },
  {
    title: "Matrix Synapse",
    description:
      "A scalable open-source server implementation of the Matrix protocol, providing secure messaging, VoIP, and federation across different Matrix networks.",
    logo: "/logos/matrix.svg",
    id: "matrix",
    tags: ["chat", "communication", "federation"],
  },
];
