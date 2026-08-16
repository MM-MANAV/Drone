"use client";

import { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import MissionImages from "./MissionImages";
import ApiMarketplace from "./ApiMarketplace";
import Settings from "./Settings";
import Chatbot from "./Chatbot";
import LiveTelemetry from "./LiveTelemetry";




/* ─── Types ─────────────────────────────────────────────────────────────── */
type MissionStatus = "Complete" | "Aborted" | "In Review";
type DisasterType = "Wildfire Suppression" | "Search & Rescue" | "Flood Assessment" | "Earthquake Response" | "Chemical Spill";

interface Mission {
  id: string;
  name: string;
  type: DisasterType;
  location: string;
  date: string;
  status: MissionStatus;
  drones: number;
}

interface FormState {
  name: string;
  type: DisasterType;
  location: string;
  objective: string;
}

interface NavItem {
  icon: ReactNode;
  label: string;
}

interface StatusStyle {
  dot: string;
  bg: string;
  text: string;
}

/* ─── SVG Icons ─────────────────────────────────────────────────────────── */
const IC: Record<string, ReactNode> = {
  menu: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  rocket: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2l.48-.5-3-3z" /><path d="M12 15.5l-3-3 7-7 3 3z" /><path d="M20 4c0 0-3.5.5-6 3l-3 3 3 3 3-3c2.5-2.5 3-6 3-6z" /></svg>,
  projects: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  api: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  bot: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><line x1="12" y1="7" x2="12" y2="11" /><line x1="8" y1="15" x2="8" y2="15" strokeWidth="3" /><line x1="16" y1="15" x2="16" y2="15" strokeWidth="3" /></svg>,
  images: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></svg>,
  settings: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  clock: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>,
  map: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 6l7-3 8 3 7-3v17l-7 3-8-3-7 3V6z" /><line x1="8" y1="3" x2="8" y2="20" /><line x1="16" y1="6" x2="16" y2="23" /></svg>,
  fire: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z" /></svg>,
  rescue: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  flood: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12l3-3 3 3 3-3 3 3 3-3 3 3" /><path d="M3 17l3-3 3 3 3-3 3 3 3-3 3 3" /></svg>,
  drone: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M6.3 6.3a8 8 0 0 0 0 11.4" /><path d="M17.7 6.3a8 8 0 0 1 0 11.4" /><path d="M3.1 3.1a13.2 13.2 0 0 0 0 17.8" /><path d="M20.9 3.1a13.2 13.2 0 0 1 0 17.8" /></svg>,
  target: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12" /></svg>,
  close: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  chevRight: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9,18 15,12 9,6" /></svg>,
  storage: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>,
  star: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>,
};

/* ─── Constants ─────────────────────────────────────────────────────────── */
const DISASTER_TYPES: DisasterType[] = [
  "Wildfire Suppression",
  "Search & Rescue",
  "Flood Assessment",
  "Earthquake Response",
  "Chemical Spill",
];

const INITIAL_MISSIONS: Mission[] = [
  { id: "WF-2904", name: "Sierra Wildfire Op", type: "Wildfire Suppression", location: "Sierra National Forest, CA", date: "Oct 24, 2023", status: "Complete", drones: 4 },
  { id: "SR-2811", name: "Glacier Peak Rescue", type: "Search & Rescue", location: "Glacier Peak, WA", date: "Oct 22, 2023", status: "Aborted", drones: 2 },
  { id: "FL-2755", name: "Miami Flood Survey", type: "Flood Assessment", location: "Miami Coastal Area, FL", date: "Oct 19, 2023", status: "Complete", drones: 6 },
  { id: "WF-2690", name: "Canyon Fire Watch", type: "Wildfire Suppression", location: "Angeles Nat. Forest, CA", date: "Oct 14, 2023", status: "Complete", drones: 3 },
  { id: "SR-2634", name: "Alpine Hiker Search", type: "Search & Rescue", location: "Rocky Mountain NP, CO", date: "Oct 10, 2023", status: "In Review", drones: 2 },
  { id: "EQ-2580", name: "Valley Damage Sweep", type: "Earthquake Response", location: "San Jose, CA", date: "Oct 6, 2023", status: "Complete", drones: 8 },
];

const STATUS_STYLES: Record<MissionStatus, StatusStyle> = {
  "Complete": { dot: "#22c55e", bg: "rgba(34,197,94,.12)", text: "#16a34a" },
  "Aborted": { dot: "#ef4444", bg: "rgba(239,68,68,.12)", text: "#dc2626" },
  "In Review": { dot: "#f59e0b", bg: "rgba(245,158,11,.12)", text: "#d97706" },
};

const TYPE_ICON: Record<DisasterType, ReactNode> = {
  "Wildfire Suppression": IC.fire,
  "Search & Rescue": IC.rescue,
  "Flood Assessment": IC.flood,
  "Earthquake Response": IC.target,
  "Chemical Spill": IC.drone,
};

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function TrinetraDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeNav, setActiveNav] = useState<string>("Projects");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [form, setForm] = useState<FormState>({
    name: "", type: "Wildfire Suppression", location: "", objective: "",
  });

  const navMain: NavItem[] = [
    { icon: IC.projects, label: "Projects" },
    { icon: IC.api, label: "API Marketplace" },
    { icon: IC.bot, label: "Chatbot" },
    { icon: IC.images, label: "Mission Images" },
  ];
  const navSystem: NavItem[] = [
    { icon: IC.settings, label: "Settings" },
  ];

  const isValid: boolean =
    form.name.trim().length > 0 &&
    form.location.trim().length > 0 &&
    form.objective.trim().length > 0;

  const activeMissionCount = missions.filter((m) => m.status !== "Complete").length;

  const handleLaunch = (): void => {
    if (!isValid) return;
    const newMission: Mission = {
      id: `NW-${Math.floor(Math.random() * 9000) + 1000}`,
      name: form.name,
      type: form.type,
      location: form.location,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "In Review",
      drones: Math.floor(Math.random() * 4) + 1,
    };
    setMissions((prev) => [newMission, ...prev]);
    setDone(true);
    setTimeout(() => {
      setShowModal(false);
      setDone(false);
      setForm({ name: "", type: "Wildfire Suppression", location: "", objective: "" });
      router.push(`/mission/${newMission.id}`);
    }, 1800);
  };

  const handleClear = (): void => {
    setForm({ name: "", type: "Wildfire Suppression", location: "", objective: "" });
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) setShowModal(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Serif:ital@0;1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .sg{display:flex;height:100vh;overflow:hidden;background:#ece9e4;font-family:'DM Sans',sans-serif;color:#1a1a1a;}

        /* ── Sidebar ── */
        .sb{width:216px;min-width:216px;background:#f5f3ef;border-right:1px solid #e2dfd9;display:flex;flex-direction:column;height:100vh;transition:width .28s cubic-bezier(.4,0,.2,1),min-width .28s cubic-bezier(.4,0,.2,1);overflow:hidden;}
        .sb.closed{width:0;min-width:0;border-right:none;}
        .sb.closed > *{opacity:0;pointer-events:none;}

        .sb-logo{display:flex;align-items:center;gap:10px;padding:18px 16px 15px;border-bottom:1px solid #e2dfd9;white-space:nowrap;}
        .sb-mark{width:30px;height:30px;border-radius:9px;background:#1a1a1a;color:#f5f3ef;display:flex;align-items:center;justify-content:center;font-family:'Instrument Serif',serif;font-size:15px;flex-shrink:0;}
        .sb-name{font-size:13px;font-weight:700;color:#1a1a1a;letter-spacing:-.02em;}
        .sb-tagline{font-size:9.5px;color:#9a9590;font-weight:500;margin-top:1px;}
        .sb-sec{font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#b5b0a8;padding:14px 16px 5px;white-space:nowrap;}
        .sb-nav{display:flex;align-items:center;gap:9px;padding:7px 10px 7px 14px;border-radius:8px;margin:1px 8px;cursor:pointer;font-size:12.5px;font-weight:500;color:#6b6560;transition:all .14s;white-space:nowrap;background:none;border:none;font-family:'DM Sans',sans-serif;width:calc(100% - 16px);text-align:left;}
        .sb-nav:hover{background:#ece9e4;color:#1a1a1a;}
        .sb-nav.on{background:#1a1a1a;color:#f5f3ef;font-weight:600;}
        .sb-foot{margin-top:auto;padding:14px;border-top:1px solid #e2dfd9;white-space:nowrap;}
        .sb-stor-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;}
        .sb-stor-lbl{display:flex;align-items:center;gap:5px;font-size:11px;color:#7a7470;font-weight:500;}
        .sb-stor-pct{font-size:11px;font-weight:700;color:#1a1a1a;}
        .sb-bar{height:3px;background:#e2dfd9;border-radius:99px;overflow:hidden;margin-bottom:10px;}
        .sb-fill{height:100%;background:#1a1a1a;border-radius:99px;width:79%;}
        .sb-upg{display:flex;align-items:center;gap:6px;justify-content:center;background:#ece9e4;border:1px solid #d8d4ce;border-radius:8px;padding:7px 12px;font-size:11.5px;font-weight:600;color:#5a5550;cursor:pointer;transition:all .14s;width:100%;font-family:'DM Sans',sans-serif;}
        .sb-upg:hover{background:#e2dfd9;color:#1a1a1a;}
        .sb-user{width:28px;height:28px;border-radius:50%;background:#1a1a1a;color:#f5f3ef;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700;margin:10px auto 0;cursor:pointer;}

        /* ── Sidebar Payment Card ── */
        .sb-pcard{margin:16px 14px;background:linear-gradient(135deg,#1a1a1a 0%,#333 100%);border-radius:12px;padding:16px;color:#fff;position:relative;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,.15);}
        .sb-pcard::before{content:'';position:absolute;top:-20%;right:-20%;width:100px;height:100px;background:rgba(255,255,255,.05);border-radius:50%;}
        .sb-pc-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;opacity:.6;margin-bottom:4px;}
        .sb-pc-val{font-size:20px;font-weight:700;letter-spacing:-.02em;margin-bottom:12px;}
        .sb-pc-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .sb-pc-chip{width:32px;height:22px;background:linear-gradient(135deg,#e2dfd9 0%,#b5b0a8 100%);border-radius:4px;position:relative;}
        .sb-pc-chip::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:12px;height:8px;border:1px solid rgba(0,0,0,.15);border-radius:1px;}
        .sb-pc-num{font-size:10px;font-family:monospace;letter-spacing:.1em;opacity:.8;}
        .sb-pc-btn{width:100%;padding:8px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:8px;color:#fff;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;backdrop-filter:blur(4px);}
        .sb-pc-btn:hover{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.4);}


        /* ── Main ── */
        .mn{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
        .tb{display:flex;align-items:center;gap:12px;padding:0 28px;height:54px;background:#ece9e4;border-bottom:1px solid #e2dfd9;flex-shrink:0;}
        .tb-tgl{width:32px;height:32px;border-radius:8px;border:1px solid #d8d4ce;background:#f5f3ef;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6b6560;flex-shrink:0;transition:all .14s;}
        .tb-tgl:hover{background:#ece9e4;color:#1a1a1a;border-color:#c5c0bb;}
        .tb-srch{flex:1;max-width:400px;position:relative;}
        .tb-srch svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#9a9590;pointer-events:none;}
        .tb-inp{width:100%;height:33px;border-radius:8px;background:#f5f3ef;border:1px solid #d8d4ce;padding:0 12px 0 32px;font-size:12.5px;color:#1a1a1a;font-family:'DM Sans',sans-serif;outline:none;transition:all .14s;}
        .tb-inp::placeholder{color:#a5a09b;}
        .tb-inp:focus{border-color:#aaa59e;background:#fff;box-shadow:0 0 0 3px rgba(26,26,26,.05);}
        .tb-right{margin-left:auto;}
        .tb-av{width:30px;height:30px;border-radius:50%;background:#1a1a1a;color:#f5f3ef;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700;cursor:pointer;border:2px solid #e2dfd9;}

        /* ── Content ── */
        .ct{flex:1;overflow-y:auto;padding:32px 36px 48px;}
        .ct::-webkit-scrollbar{width:5px;}
        .ct::-webkit-scrollbar-thumb{background:#d8d4ce;border-radius:99px;}

        /* ── Greeting ── */
        .gr{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px;}
        .gr-h{font-family:'Instrument Serif',serif;font-size:34px;font-weight:400;letter-spacing:-.02em;line-height:1.1;}
        .gr-s{font-size:12.5px;color:#8a8480;margin-top:4px;}
        .btn-cm{display:flex;align-items:center;gap:8px;background:#1a1a1a;color:#f5f3ef;border:none;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;letter-spacing:-.01em;transition:all .15s;white-space:nowrap;flex-shrink:0;box-shadow:0 2px 10px rgba(0,0,0,.16);}
        .btn-cm:hover{background:#2d2d2d;transform:translateY(-1px);box-shadow:0 5px 18px rgba(0,0,0,.2);}

        /* ── Section header ── */
        .sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;}
        .sh-lbl{font-size:9.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#a5a09b;}
        .sh-va{display:flex;align-items:center;gap:2px;font-size:12px;font-weight:600;color:#6b6560;cursor:pointer;background:none;border:none;font-family:'DM Sans',sans-serif;transition:color .14s;}
        .sh-va:hover{color:#1a1a1a;}

        /* ── Init form card ── */
        .ic{background:#f5f3ef;border:1px solid #e2dfd9;border-radius:16px;padding:22px;margin-bottom:30px;}
        .ic-head{display:flex;align-items:center;gap:10px;margin-bottom:18px;}
        .ic-icon{width:34px;height:34px;border-radius:9px;background:#1a1a1a;color:#f5f3ef;display:flex;align-items:center;justify-content:center;}
        .ic-title{font-size:15px;font-weight:700;letter-spacing:-.02em;}
        .ic-sub{font-size:11.5px;color:#9a9590;margin-top:1px;}
        .fg{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .ffc{grid-column:1/-1;}
        .fl label{display:block;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#a5a09b;margin-bottom:5px;}
        .fl input,.fl select,.fl textarea{width:100%;background:#ece9e4;border:1px solid #d8d4ce;border-radius:9px;padding:8px 11px;font-size:12.5px;color:#1a1a1a;font-family:'DM Sans',sans-serif;outline:none;transition:all .14s;appearance:none;}
        .fl input::placeholder,.fl textarea::placeholder{color:#b5b0a8;}
        .fl input:focus,.fl select:focus,.fl textarea:focus{border-color:#aaa59e;background:#fff;box-shadow:0 0 0 3px rgba(26,26,26,.05);}
        .fl textarea{resize:none;line-height:1.5;}
        .fl select{cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%239a9590' stroke-width='2' stroke-linecap='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 11px center;}
        .ff{display:flex;align-items:center;justify-content:flex-end;gap:9px;margin-top:14px;}
        .btn-clr{background:none;border:1px solid #d8d4ce;color:#7a7470;border-radius:9px;padding:8px 16px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .14s;}
        .btn-clr:hover{border-color:#aaa59e;color:#1a1a1a;}
        .btn-lnch{display:flex;align-items:center;gap:7px;background:#1a1a1a;color:#f5f3ef;border:none;border-radius:9px;padding:8px 18px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .14s;box-shadow:0 2px 8px rgba(0,0,0,.15);}
        .btn-lnch:hover{background:#2d2d2d;}
        .btn-lnch:disabled{opacity:.45;cursor:not-allowed;}

        /* ── Mission cards ── */
        .cg{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:10px;}
        .mc{background:#f5f3ef;border:1px solid #e2dfd9;border-radius:14px;padding:17px 17px 14px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;}
        .mc:hover{border-color:#c5c0bb;box-shadow:0 6px 24px rgba(0,0,0,.08);transform:translateY(-2px);}
        .mc::after{content:'';position:absolute;top:-50%;left:-60%;width:40%;height:200%;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.32) 50%,transparent 60%);transform:skewX(-10deg);transition:left .45s;pointer-events:none;}
        .mc:hover::after{left:120%;}
        .mc-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:11px;}
        .mc-ico{width:33px;height:33px;border-radius:9px;background:#ece9e4;border:1px solid #e2dfd9;display:flex;align-items:center;justify-content:center;color:#5a5550;flex-shrink:0;}
        .mc-st{display:flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;}
        .mc-id{font-size:10px;font-weight:700;color:#c5c0bb;letter-spacing:.07em;margin-bottom:3px;}
        .mc-title{font-size:13.5px;font-weight:700;color:#1a1a1a;letter-spacing:-.02em;line-height:1.3;margin-bottom:7px;}
        .mc-type{font-size:11px;color:#9a9590;margin-bottom:11px;}
        .mc-div{height:1px;background:#ece9e4;margin-bottom:9px;}
        .mc-meta{display:flex;align-items:center;gap:11px;flex-wrap:wrap;}
        .mc-chip{display:flex;align-items:center;gap:4px;font-size:11px;color:#8a8480;font-weight:500;}

        /* ── Modal ── */
        .ov{position:fixed;inset:0;background:rgba(26,26,26,.32);backdrop-filter:blur(5px);z-index:50;display:flex;align-items:center;justify-content:center;padding:20px;}
        .mod{background:#f5f3ef;border-radius:20px;width:100%;max-width:500px;box-shadow:0 24px 80px rgba(0,0,0,.18);border:1px solid #e2dfd9;overflow:hidden;animation:scIn .2s ease both;}
        .mod-h{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 0;}
        .mod-hw{display:flex;align-items:center;gap:10px;}
        .mod-ico{width:34px;height:34px;border-radius:10px;background:#1a1a1a;color:#f5f3ef;display:flex;align-items:center;justify-content:center;}
        .mod-t{font-size:15px;font-weight:700;letter-spacing:-.02em;}
        .mod-cls{width:27px;height:27px;border-radius:7px;border:1px solid #d8d4ce;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#7a7470;transition:all .14s;}
        .mod-cls:hover{background:#ece9e4;color:#1a1a1a;}
        .mod-b{padding:16px 20px 20px;}
        .succ{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:36px 20px;text-align:center;gap:12px;}
        .succ-c{width:52px;height:52px;border-radius:50%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;color:#f5f3ef;}
        .succ-t{font-size:15px;font-weight:700;}
        .succ-s{font-size:12.5px;color:#8a8480;}

        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes scIn{from{opacity:0;transform:scale(.95);}to{opacity:1;transform:scale(1);}}
        .fu{animation:fadeUp .32s ease both;}
        .d1{animation-delay:.05s;}.d2{animation-delay:.10s;}.d3{animation-delay:.14s;}.d4{animation-delay:.18s;}.d5{animation-delay:.22s;}.d6{animation-delay:.26s;}
      `}</style>

      <div className="sg">

        {/* ── Sidebar ── */}
        <aside className={`sb${sidebarOpen ? "" : " closed"}`}>
          <div className="sb-logo">
            <div className="sb-mark" style={{ borderRadius: '6px', background: '#111' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <div>
              <div className="sb-name" style={{ fontSize: '15px' }}>Trinetra</div>
              <div className="sb-tagline">TACTICAL INTEL</div>
            </div>
          </div>

          <div className="sb-sec">Main Menu</div>
          {navMain.map(({ icon, label }) => (
            <button
              key={label}
              className={`sb-nav${activeNav === label ? " on" : ""}`}
              onClick={() => setActiveNav(label)}
            >
              {icon}{label}
            </button>
          ))}

          <div className="sb-sec" style={{ marginTop: 8 }}>System</div>
          {navSystem.map(({ icon, label }) => (
            <button
              key={label}
              className={`sb-nav${activeNav === label ? " on" : ""}`}
              onClick={() => setActiveNav(label)}
            >
              {icon}{label}
            </button>
          ))}

          {activeNav === "API Marketplace" && (
            <div className={`sb-pcard fu${sidebarOpen ? "" : " hidden"}`}>
              <div className="sb-pc-lbl">Marketplace Balance</div>
              <div className="sb-pc-val">$3,842.50</div>
              <div className="sb-pc-row">
                <div className="sb-pc-num">•••• 8291</div>
                <div className="sb-pc-chip"></div>
              </div>
              <button className="sb-pc-btn">Refill Credits</button>
            </div>
          )}

          <div className="sb-foot">

            <div className="sb-stor-row">
              <span className="sb-stor-lbl">{IC.storage} Storage</span>
              <span className="sb-stor-pct">79%</span>
            </div>
            <div className="sb-bar"><div className="sb-fill" /></div>
            <button className="sb-upg">{IC.star} Upgrade Plan</button>
            <div className="sb-user">KR</div>
          </div>
        </aside>

        {/* ── Main ── */}
        {activeNav === "Mission Images" ? (
          <div className="mn" style={{ background: '#fff' }}>
            <MissionImages />
          </div>
        ) : activeNav === "API Marketplace" ? (
          <div className="mn" style={{ background: '#ece9e4' }}>
            <div className="tb">
              <button className="tb-tgl" onClick={() => setSidebarOpen((o) => !o)}>
                {IC.menu}
              </button>
              <div className="tb-right">
                <div className="tb-av">KR</div>
              </div>
            </div>
            <div className="ct" style={{ padding: 0 }}>
              <ApiMarketplace />
            </div>
          </div>
        ) : activeNav === "Settings" ? (
          <div className="mn">
            <div className="tb">
              <button className="tb-tgl" onClick={() => setSidebarOpen((o) => !o)}>
                {IC.menu}
              </button>
              <div className="tb-right">
                <div className="tb-av">KR</div>
              </div>
            </div>
            <div className="ct" style={{ padding: 0 }}>
              <Settings />
            </div>
          </div>
        ) : activeNav === "Chatbot" ? (
          <div className="mn">
            <div className="tb">
              <button className="tb-tgl" onClick={() => setSidebarOpen((o) => !o)}>
                {IC.menu}
              </button>
              <div className="tb-right">
                <div className="tb-av">KR</div>
              </div>
            </div>
            <div className="ct" style={{ padding: 0 }}>
              <Chatbot />
            </div>
          </div>
        ) : activeNav === "Live Telemetry" ? (
          <div className="mn">
            <div className="tb">
              <button className="tb-tgl" onClick={() => setSidebarOpen((o) => !o)}>
                {IC.menu}
              </button>
              <div className="tb-right">
                <div className="tb-av">KR</div>
              </div>
            </div>
            <div className="ct" style={{ padding: 0 }}>
              <LiveTelemetry />
            </div>
          </div>
        ) : (
          <div className="mn">




            {/* Topbar */}
            <div className="tb">
              <button className="tb-tgl" onClick={() => setSidebarOpen((o) => !o)}>
                {IC.menu}
              </button>
              <div className="tb-srch">
                {IC.search}
                <input className="tb-inp" placeholder="Search missions…" />
              </div>
              <div className="tb-right">
                <div className="tb-av">KR</div>
              </div>
            </div>

            {/* Content */}
            <div className="ct">

              {/* Greeting */}
              <div className="gr fu">
                <div>
                  <div className="gr-h">Good afternoon, Krish</div>
                  <div className="gr-s">You have {activeMissionCount} active mission{activeMissionCount !== 1 ? "s" : ""} in progress.</div>
                </div>
                <button className="btn-cm" onClick={() => setShowModal(true)}>
                  {IC.plus} Create Mission
                </button>
              </div>

              {/* Channel Adapters label */}
              <div className="sh fu d1">
                <span className="sh-lbl">Channel Adapters</span>
              </div>

              {/* Initialize New Mission – inline form */}
              <div className="ic fu d1">
                <div className="ic-head">
                  <div className="ic-icon">{IC.drone}</div>
                  <div>
                    <div className="ic-title">Initialize New Mission</div>
                    <div className="ic-sub">Configure and deploy a new drone operation</div>
                  </div>
                </div>

                <div className="fg">
                  <div className="fl">
                    <label>Mission Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Sierra Alpha-7"
                    />
                  </div>
                  <div className="fl">
                    <label>Disaster Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as DisasterType }))}
                    >
                      {DISASTER_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="fl">
                    <label>Drone Location</label>
                    <input
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="Lat, Long or region name"
                    />
                  </div>
                  <div className="fl ffc">
                    <label>Mission Objective</label>
                    <textarea
                      rows={2}
                      value={form.objective}
                      onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
                      placeholder="Define tactical objectives for autonomous drone flight paths…"
                    />
                  </div>
                </div>

                <div className="ff">
                  <button className="btn-clr" onClick={handleClear}>Clear</button>
                  <button className="btn-lnch" onClick={handleLaunch} disabled={!isValid}>
                    {IC.rocket} Launch Mission
                  </button>
                </div>
              </div>

              {/* Past Missions */}
              <div className="sh fu d2">
                <span className="sh-lbl">Past Missions</span>
                <button className="sh-va">View All {IC.chevRight}</button>
              </div>

              <div className="cg">
                {missions.map((m, i) => {
                  const s = STATUS_STYLES[m.status];
                  return (
                    <div key={m.id} className={`mc fu d${Math.min(i + 2, 6)}`} onClick={() => router.push(`/mission/${m.id}`)}>
                      <div className="mc-top">
                        <div className="mc-ico">{TYPE_ICON[m.type]}</div>
                        <div
                          className="mc-st"
                          style={{ background: s.bg, color: s.text }}
                        >
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                          {m.status}
                        </div>
                      </div>
                      <div className="mc-id">#{m.id}</div>
                      <div className="mc-title">{m.name}</div>
                      <div className="mc-type">{m.type}</div>
                      <div className="mc-div" />
                      <div className="mc-meta">
                        <span className="mc-chip">{IC.clock} {m.date}</span>
                        <span className="mc-chip">{IC.map} {m.location.split(",")[0]}</span>
                        <span className="mc-chip">{IC.drone} {m.drones} drone{m.drones !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>{/* /ct */}
          </div>
        )}{/* /mn */}
      </div>{/* /sg */}

      {/* ── Modal ── */}
      {showModal && (
        <div className="ov" onClick={handleOverlayClick}>
          <div className="mod">
            {done ? (
              <div className="succ">
                <div className="succ-c">{IC.check}</div>
                <div className="succ-t">Mission Launched!</div>
                <div className="succ-s">Your mission has been initialized and added to the queue.</div>
              </div>
            ) : (
              <>
                <div className="mod-h">
                  <div className="mod-hw">
                    <div className="mod-ico">{IC.rocket}</div>
                    <span className="mod-t">Create New Mission</span>
                  </div>
                  <button className="mod-cls" onClick={() => setShowModal(false)}>
                    {IC.close}
                  </button>
                </div>
                <div className="mod-b">
                  <div className="fg">
                    <div className="fl">
                      <label>Mission Name</label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Sierra Alpha-7"
                      />
                    </div>
                    <div className="fl">
                      <label>Disaster Type</label>
                      <select
                        value={form.type}
                        onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as DisasterType }))}
                      >
                        {DISASTER_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="fl ffc">
                      <label>Drone Location</label>
                      <input
                        value={form.location}
                        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                        placeholder="Lat, Long or region name"
                      />
                    </div>
                    <div className="fl ffc">
                      <label>Mission Objective</label>
                      <textarea
                        rows={3}
                        value={form.objective}
                        onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
                        placeholder="Define tactical objectives for autonomous drone flight paths…"
                      />
                    </div>
                  </div>
                  <div className="ff">
                    <button className="btn-clr" onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="btn-lnch" onClick={handleLaunch} disabled={!isValid}>
                      {IC.rocket} Launch Mission
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
