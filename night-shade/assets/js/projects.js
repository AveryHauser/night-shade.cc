/*
  night-shade.cc — project data
  ------------------------------------------------------------------
  This is the only file you need to touch to update the site.
  Each project becomes a card and a fruit on the hero plant:
    running  -> ripe (black) berry
    building -> green berry
    planned  -> flower
    idea     -> bud
  Keep `host` to a short machine name (it's shown as "runs on …").
  Optional fields: url, notes[], next.
*/
window.NS_DATA = {
  updated: "September 2026",

  fields: {
    ai: "Local AI",
    security: "Security",
    infra: "Infrastructure",
    club: "Club",
    web: "Web & dev"
  },

  statuses: {
    running:  { label: "Running",  fruit: "Ripe berry" },
    building: { label: "Building", fruit: "Green berry" },
    planned:  { label: "Planned",  fruit: "Flower" },
    idea:     { label: "Idea",     fruit: "Bud" }
  },

  projects: [
    {
      id: "local-llm",
      title: "Local inference node",
      field: "ai",
      status: "building",
      host: "pve",
      summary: "Running open-weight models on my own desktop: llama.cpp's Vulkan backend on an RX580 8 GB, passed through to a Debian 12 container on Proxmox VE 9.",
      stack: ["Proxmox VE 9", "LXC", "GPU passthrough", "llama.cpp", "Vulkan"],
      notes: [
        "Vulkan backend, so the Polaris-era card runs without ROCm.",
        "A container rather than a VM: the GPU is shared into the LXC and the host stays lean.",
        "Proxmox lives on its own subnet, apart from the rest of the home network."
      ],
      next: "Pick the next GPU — see the open decision below."
    },
    {
      id: "harness",
      title: "Agent harness on a local model",
      field: "ai",
      status: "building",
      host: "pve",
      summary: "Setting up DeepSeek Harness (dsh), an open-source agent framework, in the same container so agents run against my local model instead of a paid API.",
      stack: ["DeepSeek Harness", "llama.cpp server", "Debian 12"],
      notes: [
        "Same LXC as the inference server: one container to snapshot and roll back.",
        "Part of getting into local models, training and harnesses — starting with the harness."
      ],
      next: "Get dsh talking to the local llama.cpp endpoint."
    },
    {
      id: "optout",
      title: "OptOut",
      field: "security",
      status: "running",
      host: "nightshade",
      summary: "A personal data-broker opt-out assistant I built to spec. Human review is the default — nothing goes out until I approve it.",
      stack: ["SQLite", "SQLCipher", "rootless Podman", "Quadlet", "Tailscale"],
      notes: [
        "Database encrypted at rest with SQLCipher.",
        "Reachable only over the tailnet. No public endpoint.",
        "A fully autonomous mode exists, but it sits behind a hardcoded switch that stays off for now."
      ],
      next: "Flip the autonomous switch — later, once it has earned it."
    },
    {
      id: "pi",
      title: "nightshade, the Pi",
      field: "infra",
      status: "running",
      host: "nightshade",
      summary: "A Raspberry Pi 5 on Ubuntu Server. It's my Tailscale exit node and the always-on host for small self-hosted services.",
      stack: ["Raspberry Pi 5", "Ubuntu Server", "Tailscale exit node", "rootless Podman"],
      notes: [
        "Hosts OptOut and Actual Budget, each as a rootless Podman Quadlet unit.",
        "Every service is tailnet-only.",
        "Constraints I work around: a 64 GB SD card and no UPS."
      ]
    },
    {
      id: "club-site",
      title: "ohio-cyber.us",
      field: "club",
      status: "running",
      host: "github",
      url: "https://ohio-cyber.us",
      summary: "The OHIO Cybersecurity Club website. I work on it as vice president; the source lives in the club's main-website repo on GitHub.",
      stack: ["GitHub", "main-website"],
      notes: [
        "Club info, officers and branding, kept in version control so the next officers can pick it up."
      ]
    },
    {
      id: "club-server",
      title: "Club lab server",
      field: "club",
      status: "planned",
      host: "t5610",
      summary: "Turning a spare Dell Precision T5610 into a server the club can use, on its own isolated subnet.",
      stack: ["Dell Precision T5610", "Cloudflare Tunnel", "Cloudflare Access", "TP-Link AC1200"],
      notes: [
        "CPU upgrade first, for more cores.",
        "Members reach it through a Cloudflare Tunnel behind an Access login — no ports forwarded on the home router.",
        "A second router, added alongside the ISP's, handles the subnetting; the AC1200 access point serves the isolated network."
      ],
      next: "Get the new router and carve out the club subnet."
    },
    {
      id: "range",
      title: "Practice range",
      field: "security",
      status: "building",
      host: "t14",
      summary: "Cybersecurity practice VMs on my daily laptop — isolated from everything else and only started when I need them.",
      stack: ["ThinkPad T14 Gen 3", "i7-1270P", "32 GB RAM", "VMs"],
      notes: [
        "On-demand by design: nothing vulnerable sits running in the background."
      ]
    },
    {
      id: "malware-bench",
      title: "Air-gapped malware bench",
      field: "security",
      status: "planned",
      host: "t470s",
      summary: "A ThinkPad T470s set aside for malware analysis and kept completely offline.",
      stack: ["ThinkPad T470s", "air gap"],
      notes: [
        "Physically separate from the rest of the lab — no Wi-Fi, no tailnet."
      ]
    },
    {
      id: "site",
      title: "night-shade.cc",
      field: "web",
      status: "running",
      host: "cloudflare",
      summary: "This site. Hand-written HTML, CSS and a little JavaScript on Cloudflare Pages — no framework, no build step, no analytics.",
      stack: ["HTML", "CSS", "JavaScript", "Cloudflare Pages"],
      notes: [
        "Strict security headers and a security.txt, because a security person's site should have them.",
        "Every project lives in one data file, so an update is a one-line edit."
      ]
    },
    {
      id: "shop",
      title: "Order book for a small shop",
      field: "web",
      status: "idea",
      host: "",
      summary: "I run a small farm-and-craft side business and I'm new to handling orders. A lightweight order tracker is the obvious thing to build next."
    }
  ]
};
