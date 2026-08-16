/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect, ReactNode } from "react";


import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import dynamic from 'next/dynamic';
import jsPDF from 'jspdf';
import CryptoJS from 'crypto-js';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifySelf: 'center', background: '#f3f4f6', color: '#8a8a8a', fontSize: '10px', fontWeight: 700 }}>LOADING TACTICAL MAP...</div>
});

const IC: Record<string, ReactNode> = {
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  userSearch: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><circle cx="18" cy="11" r="3" /><line x1="20.12" y1="13.12" x2="22" y2="15" /></svg>,
  kit: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2" ry="2" /><path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" /><line x1="12" y1="10" x2="12" y2="16" /><line x1="9" y1="13" x2="15" y2="13" /></svg>,
  payload: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
  alert: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>,
  video: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" /></svg>,
  zoomIn: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>,
  zoomOut: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>,
  expand: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>,
  record: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>,
};

export default function MissionDashboard() {
  const router = useRouter();
  const { id } = useParams();
  const missionId = Array.isArray(id) ? id[0] : (id as string);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fullScreenVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [activeTab, setActiveTab] = useState<"Missions" | "Analytics" | "Reports">("Missions");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedPdfUrl, setDecryptedPdfUrl] = useState<string | null>(null);
  const [decryptionKeyInput, setDecryptionKeyInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Telemetry State
  // delivered = 10 - movesLeft (driven by ESP-NOW MOVES_LEFT)
  // battery is hardcoded to 100% / 24.25V as per spec
  const [telemetry, setTelemetry] = useState({
    lat: 0.0,
    lng: 0.0,
    alt: 0,
    vel: 0,
    batt: 100,        // Initially 100%, driven by live telemetry
    voltage: 25.2,    // Initially 25.2V, driven by live telemetry
    health: 98.4,
    delivered: 0,     // = 10 - movesLeft
    hdop: 99.99,
    movesLeft: 10     // Live from ESP-NOW MOVES_LEFT
  });

  const [telemetryHistory, setTelemetryHistory] = useState<{batt: number, alt: number, vel: number}[]>([]);

  const [pcLocation, setPcLocation] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState(0);

  const [humanCount, setHumanCount] = useState(0);
  const [prevTelemetry, setPrevTelemetry] = useState(telemetry);
  const [prevHumanCount, setPrevHumanCount] = useState(0);
  const [detectionsList, setDetectionsList] = useState<{filename: string, url: string}[]>([]);
  const [latestDetections, setLatestDetections] = useState<{x: number, y: number, w: number, h: number, conf: number}[]>([]);
  const [videoSize, setVideoSize] = useState({ w: 1280, h: 720 });
  const [selectedModel, setSelectedModel] = useState<"WALDO30-Y8M" | "YOLOv8m" | "version3">("WALDO30-Y8M");

  // COM Port selector state
  const [availablePorts, setAvailablePorts] = useState<{port: string, description: string, active: boolean}[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>("");
  const [portConnected, setPortConnected] = useState<boolean>(false);
  const [portConnecting, setPortConnecting] = useState<boolean>(false);
  const [portFetchError, setPortFetchError] = useState<boolean>(false);

  // Camera Device selector state
  const [availableCameras, setAvailableCameras] = useState<{deviceId: string, label: string}[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [cameraStatus, setCameraStatus] = useState<"loading" | "active" | "error">("loading");
  const [cameraError, setCameraError] = useState<string>("");

  const [logs, setLogs] = useState<{time: string, type: string, msg: string, color: string}[]>([
    { time: "14:22:04", type: "[DELIVERY]", msg: "Kit #45 deployed at Sector 4G", color: "#1a1a1a" },
    { time: "14:21:12", type: "[DETECTION]", msg: "Human signature confirmed (3)", color: "#059669" },
    { time: "14:18:55", type: "[WARNING]", msg: "Signal interference detected.", color: "#d97706" }
  ]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const logBodyRef = useRef<HTMLDivElement>(null);
  const rawTerminalRef = useRef<HTMLDivElement>(null);
  const [rawSerialLogs, setRawSerialLogs] = useState<string[]>([]);

  // Feed OSD Console state
  const osdTerminalRef = useRef<HTMLDivElement>(null);
  const [osdLogs, setOsdLogs] = useState<string[]>([]);

  const addLog = (type: string, msg: string, color: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    setLogs(prev => [...prev.slice(-49), { time, type, msg, color }]); // Keep last 50, append to bottom
  };

  // Fetch available COM ports from backend
  const fetchPorts = async () => {
    try {
      const res = await fetch("http://localhost:8000/list-ports");
      if (res.ok) {
        const data = await res.json();
        setAvailablePorts(data);
        setPortFetchError(false);
        // Auto-select the active port if nothing is selected yet
        const active = data.find((p: {port: string, active: boolean}) => p.active);
        if (active && !selectedPort) setSelectedPort(active.port);
        else if (data.length > 0 && !selectedPort) setSelectedPort(data[0].port);
      }
    } catch {
      setPortFetchError(true);
    }
  };

  const handleConnectPort = async () => {
    if (!selectedPort) return;
    setPortConnecting(true);
    try {
      await fetch("http://localhost:8000/set-port", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port: selectedPort })
      });
      addLog("[SERIAL]", `Switching to COM port: ${selectedPort}`, "#3b82f6");
    } catch {
      addLog("[ALERT]", `Failed to connect to ${selectedPort}`, "#ef4444");
    } finally {
      setTimeout(() => setPortConnecting(false), 2000);
    }
  };



  const missionStages = [
    { label: "DEPARTURE", status: "complete", time: "12:04" },
    { label: "WAYPOINT ALPHA", status: "complete", time: "12:15" },
    { label: "SECTOR DEPLOY", status: "current", time: "12:32" },
    { label: "TARGET REACHED", status: "pending", time: "--:--" },
    { label: "DELIVERY", status: "pending", time: "--:--" },
  ];

  const handleDownloadReport = () => {
    setIsGeneratingReport(true);
    
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const now = new Date().toLocaleString();
        const key = `TRN-ASM32-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(26, 26, 26);
        doc.text("TRINETRA TACTICAL REPORT", 10, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(138, 138, 138);
        doc.text(`GENERATED: ${now}`, 10, 30);
        doc.text(`MISSION: OPERATION SENTINEL - ALPHA`, 10, 35);
        doc.text(`TERMINAL: HK-9821-X`, 10, 40);
        
        doc.setLineWidth(0.5);
        doc.line(10, 45, 200, 45);

        // Telemetry Summary
        doc.setFontSize(14);
        doc.setTextColor(26, 26, 26);
        doc.text("Mission Telemetry Summary", 10, 55);
        
        doc.setFontSize(11);
        doc.text(`Final Coordinates: ${telemetry.lat.toFixed(6)} N, ${telemetry.lng.toFixed(6)} W`, 15, 65);
        doc.text(`Current Altitude: ${telemetry.alt.toFixed(1)}m`, 15, 72);
        doc.text(`Current Velocity: ${telemetry.vel.toFixed(1)}m/s`, 15, 79);
        doc.text(`Battery Status: 100% (24.25V)`, 15, 86);
        doc.text(`Humans Detected: ${humanCount}`, 15, 93);
        doc.text(`Medikits Delivered: ${telemetry.delivered} / 10`, 15, 100);
        doc.text(`Payload Remaining: ${(telemetry.movesLeft * 0.5).toFixed(1)} kg (${telemetry.movesLeft} units)`, 15, 107);

        // Activity Logs
        doc.setFontSize(14);
        doc.text("Activity Logs", 10, 120);
        
        let y = 130;
        doc.setFontSize(9);
        logs.forEach((log, i) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.setTextColor(100, 100, 100);
          doc.text(log.time, 10, y);
          doc.setTextColor(0, 0, 0);
          doc.setFont(undefined, 'bold');
          doc.text(log.type, 30, y);
          doc.setFont(undefined, 'normal');
          doc.text(log.msg, 60, y);
          y += 7;
        });

        // Generate PDF bytes
        const pdfOutput = doc.output();
        
        // Encrypt PDF data
        const encrypted = CryptoJS.AES.encrypt(pdfOutput, key).toString();
        
        // Create file blob
        const blob = new Blob([encrypted], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MISSION_REPORT_${Date.now()}.aes`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setEncryptionKey(key);
      } catch (err) {
        console.error("Failed to generate report:", err);
      } finally {
        setIsGeneratingReport(false);
      }
    }, 2000);
  };

  const handleDecryptReport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !decryptionKeyInput) return;

    setIsDecrypting(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const encryptedData = event.target?.result as string;
        const decrypted = CryptoJS.AES.decrypt(encryptedData, decryptionKeyInput);
        const pdfString = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (!pdfString) throw new Error("Invalid Key");

        const byteCharacters = pdfString;
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        setDecryptedPdfUrl(url);
        addLog("[SECURITY]", "Intelligence report decrypted successfully", "#10b981");
      } catch (err) {
        console.error("Decryption failed", err);
        addLog("[ALERT]", "Decryption failed: Invalid key or corrupt file", "#ef4444");
        alert("Decryption failed. Please check your key.");
      } finally {
        setIsDecrypting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  const startCamera = async (deviceId?: string) => {
    if (activeTab !== "Missions") return;
    setCameraStatus("loading");
    setCameraError("");

    // Stop existing stream tracks if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    try {
      let targetDeviceId = deviceId || selectedCameraId;

      // Attempt to find a preferred external/COM camera over integrated ones
      if (!targetDeviceId) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(d => d.kind === "videoinput");
          
          const externalCamera = videoDevices.find(d => {
            const label = d.label.toLowerCase();
            return label && !label.includes("integrated") && !label.includes("built-in") && !label.includes("facetime");
          });

          if (externalCamera) {
            targetDeviceId = externalCamera.deviceId;
          } else if (videoDevices.length > 0 && videoDevices[0].deviceId) {
            targetDeviceId = videoDevices[0].deviceId;
          }
        } catch (e) {
          console.warn("Could not pre-enumerate devices for preference checking", e);
        }
      }

      const constraintsList: MediaStreamConstraints[] = targetDeviceId
        ? [
            { video: { deviceId: { exact: targetDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } } },
            { video: { deviceId: { exact: targetDeviceId } } },
            { video: true }
          ]
        : [
            { video: { width: { ideal: 1280 }, height: { ideal: 720 } } },
            { video: true },
          ];

      let stream: MediaStream | null = null;
      let lastErr: any = null;

      for (const constraint of constraintsList) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          if (stream) break;
        } catch (e) {
          lastErr = e;
          console.warn("Retrying camera with fallback constraint...", e);
        }
      }

      if (!stream) {
        throw lastErr || new Error("No camera stream available");
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("video.play() warning:", playErr);
        }
      }
      if (fullScreenVideoRef.current) {
        fullScreenVideoRef.current.srcObject = stream;
        try {
          await fullScreenVideoRef.current.play();
        } catch (fsPlayErr) {
          console.warn("fullscreen video.play() warning:", fsPlayErr);
        }
      }

      setCameraStatus("active");

      // Enumerate available video devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices
          .filter(d => d.kind === "videoinput")
          .map((d, index) => ({
            deviceId: d.deviceId,
            label: d.label || `Camera ${index + 1}`
          }));
        setAvailableCameras(videoDevices);
        
        const activeTrack = stream.getVideoTracks()[0];
        const activeSettings = activeTrack?.getSettings();
        if (activeSettings?.deviceId && !selectedCameraId) {
          setSelectedCameraId(activeSettings.deviceId);
        }
      } catch (enumErr) {
        console.warn("Device enumeration error:", enumErr);
      }

    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraStatus("error");
      const name = err?.name || "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraError("Camera permission denied. Please allow camera access in your browser address bar.");
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setCameraError("Camera is in use by another program (OBS, Zoom, Windows Camera, etc.). Close other apps using the camera and click Retry.");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setCameraError("No camera device detected. Please connect your USB drone video receiver or webcam.");
      } else {
        setCameraError(err?.message || "Failed to start camera feed. Please check connection.");
      }
    }
  };

  useEffect(() => {
    if (activeTab === "Missions") {
      startCamera();
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (isFullScreen && fullScreenVideoRef.current && streamRef.current) {
      fullScreenVideoRef.current.srcObject = streamRef.current;
    }
  }, [isFullScreen]);

  // Telemetry History Updater (advances graphs without artificial fluctuation)
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        setTelemetryHistory(hist => [...hist.slice(-20), { batt: prev.batt, alt: prev.alt, vel: prev.vel }]);
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchPorts();
  }, []);

  // Fetch Raw Serial Logs
  useEffect(() => {
    const fetchSerialLogs = async () => {
      if (activeTab !== "Missions") return;
      try {
        const response = await fetch("http://localhost:8000/serial-logs");
        if (response.ok) {
          const data = await response.json();
          setRawSerialLogs(data.logs || []);
        }
      } catch (err) {
        // ignore
      }
    };
    
    const interval = setInterval(fetchSerialLogs, 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (rawTerminalRef.current) {
      rawTerminalRef.current.scrollTop = rawTerminalRef.current.scrollHeight;
    }
  }, [rawSerialLogs]);

  // Fetch Feed OSD Logs
  useEffect(() => {
    const fetchOsdLogs = async () => {
      if (activeTab !== "Missions") return;
      try {
        const response = await fetch("http://localhost:8000/feed-osd-logs");
        if (response.ok) {
          const data = await response.json();
          setOsdLogs(data.logs || []);
        }
      } catch (err) {
        // ignore
      }
    };
    
    const interval = setInterval(fetchOsdLogs, 1500);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (osdTerminalRef.current) {
      osdTerminalRef.current.scrollTop = osdTerminalRef.current.scrollHeight;
    }
  }, [osdLogs]);

  // Fetch Real-time GPS + MOVES_LEFT from ESP-NOW (via Backend) — 1Hz
  useEffect(() => {
    const fetchGpsData = async () => {
      if (activeTab !== "Missions") return;
      
      try {
        const response = await fetch("http://localhost:8000/gps");
        if (response.ok) {
          const data = await response.json();
          // Derive delivered count and payload from MOVES_LEFT (preserve previous if missing)
          const newMovesLeft = typeof data.moves_left === 'number' ? data.moves_left : prevTelemetry.movesLeft;
          const newDelivered = 10 - newMovesLeft;
          setTelemetry(prev => ({
            ...prev,
            lat: data.lat,
            lng: data.lng,
            hdop: data.hdop ?? prev.hdop,
            movesLeft: newMovesLeft,
            delivered: newDelivered
          }));
        }
      } catch (err) {
        console.error("Failed to fetch ESP-NOW GPS data:", err);
      }
    };

    const interval = setInterval(fetchGpsData, 1000); // 1Hz update
    return () => clearInterval(interval);
  }, [activeTab]);

  // Fetch Captured Images for this mission
  useEffect(() => {
    const fetchDetections = async () => {
      if (!missionId) return;
      try {
        const response = await fetch(`http://localhost:8000/list-detections/${missionId}`);
        if (response.ok) {
          const data = await response.json();
          setDetectionsList(data);
        }
      } catch (err) {
        console.error("Failed to fetch detections:", err);
      }
    };

    fetchDetections();
    const interval = setInterval(fetchDetections, 5000); // 5s update
    return () => clearInterval(interval);
  }, [missionId]);

  // Image Processing for Human Detection
  useEffect(() => {
    const processFrame = async () => {
      if (!videoRef.current || !canvasRef.current || activeTab !== "Missions") return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx && video.readyState >= 2) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL("image/jpeg", 0.7);

        try {
          const response = await fetch("http://localhost:8000/analyze-feed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              image_base64: base64Image,
              voltage: telemetry.voltage,
              mission_id: missionId,
              model_name: selectedModel
            }),
          });

          if (response.ok) {
            const result = await response.json();
            
            // Update Human Detection
            if (result.detections && result.detections.status === "success") {
              const newCount = result.detections.human_count;
              if (newCount !== humanCount && newCount > 0) {
                addLog("[DETECTION]", `Human signature confirmed (${newCount})`, "#059669");
              }
              setHumanCount(newCount);
              setLatestDetections(result.detections.detections || []);
              if (video.videoWidth) {
                setVideoSize({ w: video.videoWidth, h: video.videoHeight });
              }
            }
            
            // Update Battery, Alt, Vel from analyze-feed OCR and Telemetry
            if (result.telemetry && result.telemetry.percentage !== undefined) {
              setTelemetry(prev => {
                let parsedAlt = prev.alt;
                let parsedVel = prev.vel;
                
                if (result.osd_text) {
                  for (const line of result.osd_text) {
                    const altMatch = line.match(/ALT:\s*([\d\.]+)/);
                    if (altMatch) parsedAlt = parseFloat(altMatch[1]);
                    const velMatch = line.match(/VEL:\s*([\d\.]+)/);
                    if (velMatch) parsedVel = parseFloat(velMatch[1]);
                  }
                }

                return {
                  ...prev,
                  batt: result.telemetry.percentage,
                  voltage: result.telemetry.voltage,
                  alt: parsedAlt,
                  vel: parsedVel
                };
              });
            }
          }
        } catch (err) {
          console.error("Analysis API unreachable", err);
        }
      }
    };

    const interval = setInterval(processFrame, 3000); // Analyze every 3 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, telemetry.voltage, humanCount, selectedModel]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logBodyRef.current) {
      logBodyRef.current.scrollTop = logBodyRef.current.scrollHeight;
    }
  }, [logs]);

  // Comprehensive Logging for Component Fluctuations
  useEffect(() => {
    // 1. Human Count Fluctuation
    if (humanCount !== prevHumanCount) {
      if (humanCount > prevHumanCount) {
        addLog("[DETECTION]", `Increase in human signatures: ${humanCount} detected`, "#059669");
      } else if (humanCount < prevHumanCount && humanCount > 0) {
        addLog("[DETECTION]", `Human count decreased to ${humanCount}`, "#10b981");
      } else if (humanCount === 0 && prevHumanCount > 0) {
        addLog("[SECURITY]", "Area cleared: No human signatures remaining", "#1a1a1a");
      }
      setPrevHumanCount(humanCount);
    }

    // 2. Battery is hardcoded — no logging needed

    // 3. Altitude Fluctuation
    if (Math.abs(telemetry.alt - prevTelemetry.alt) >= 3) {
      const action = telemetry.alt > prevTelemetry.alt ? "Climbing" : "Descending";
      addLog("[FLIGHT]", `${action} reached alt ${telemetry.alt.toFixed(0)}m`, "#3b82f6");
      setPrevTelemetry(t => ({ ...t, alt: telemetry.alt }));
    }

    // 4. Velocity Fluctuation
    if (Math.abs(telemetry.vel - prevTelemetry.vel) >= 2) {
      const action = telemetry.vel > prevTelemetry.vel ? "Accelerating" : "Decelerating";
      addLog("[FLIGHT]", `${action} to speed ${telemetry.vel.toFixed(1)}m/s`, "#f59e0b");
      setPrevTelemetry(t => ({ ...t, vel: telemetry.vel }));
    }

    // 5. Health Fluctuation
    if (Math.abs(telemetry.health - prevTelemetry.health) >= 0.5) {
      addLog("[SYSTEM]", `System health variance: ${telemetry.health.toFixed(1)}%`, "#6366f1");
      setPrevTelemetry(t => ({ ...t, health: telemetry.health }));
    }

    // 6. Delivery: triggered when movesLeft decreases (new drop completed)
    if (telemetry.movesLeft < prevTelemetry.movesLeft) {
      addLog("[DELIVERY]", `Medikit #${telemetry.delivered} deployed — ${telemetry.movesLeft} drops remaining`, "#10b981");
      setPrevTelemetry(t => ({ ...t, movesLeft: telemetry.movesLeft, delivered: telemetry.delivered }));
    }

  }, [telemetry, humanCount, prevTelemetry, prevHumanCount]);

  // Fetch PC GPS Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setPcLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation access denied or unavailable.", error);
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Calculate distance when either drone or PC location updates
  useEffect(() => {
    if (pcLocation && telemetry.lat !== undefined && telemetry.lng !== undefined) {
      if (telemetry.lat === 0 && telemetry.lng === 0) {
        setDistance(0);
        return;
      }
      const R = 6371; // Earth radius in km
      const dLat = (telemetry.lat - pcLocation.lat) * Math.PI / 180;
      const dLon = (telemetry.lng - pcLocation.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(pcLocation.lat * Math.PI / 180) * Math.cos(telemetry.lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const d = R * c;
      setDistance(d);
    }
  }, [pcLocation, telemetry.lat, telemetry.lng]);





  const BatteryGraph = () => {
    const maxLen = Math.max(1, telemetryHistory.length - 1);
    const path = telemetryHistory.length > 0 
      ? telemetryHistory.map((pt, i) => `${i === 0 ? 'M' : 'L'}${(i / maxLen) * 400},${100 - pt.batt}`).join(" ")
      : "M0,20 L40,25 L80,35 L120,38 L160,45 L200,50 L240,65 L280,72 L320,78 L360,82 L400,85";
    return (
      <svg className="graph-svg" viewBox="0 0 400 100" preserveAspectRatio="none">
        <path className="graph-grid" d="M0 25 L400 25 M0 50 L400 50 M0 75 L400 75" />
        <path className="graph-path-batt" d={path} />
        <text className="graph-lbl" x="0" y="20">100%</text>
        <text className="graph-lbl" x="0" y="95">0%</text>
      </svg>
    );
  };

  const AltitudeGraph = () => {
    const maxLen = Math.max(1, telemetryHistory.length - 1);
    const path = telemetryHistory.length > 0
      ? telemetryHistory.map((pt, i) => `${i === 0 ? 'M' : 'L'}${(i / maxLen) * 400},${100 - (pt.alt / 150) * 100}`).join(" ")
      : "M0,80 L40,75 L80,50 L120,40 L160,45 L200,30 L240,35 L280,50 L320,60 L360,65 L400,70 L400,100 L0,100 Z";
    
    const filledPath = telemetryHistory.length > 0 
      ? `${path} L400,100 L0,100 Z` 
      : path;

    return (
      <svg className="graph-svg" viewBox="0 0 400 100" preserveAspectRatio="none">
        <path className="graph-grid" d="M0 25 L400 25 M0 50 L400 50 M0 75 L400 75" />
        <path className="graph-path-alt" d={filledPath} />
        <text className="graph-lbl" x="0" y="20">150m</text>
        <text className="graph-lbl" x="0" y="95">0m</text>
      </svg>
    );
  };

  const SpeedGraph = () => {
    const maxLen = Math.max(1, telemetryHistory.length - 1);
    const path = telemetryHistory.length > 0
      ? telemetryHistory.map((pt, i) => `${i === 0 ? 'M' : 'L'}${(i / maxLen) * 400},${100 - (pt.vel / 30) * 100}`).join(" ")
      : "M0,60 L40,50 L80,70 L120,65 L160,20 L200,25 L240,50 L280,45 L320,48 L360,52 L400,55";
    return (
      <svg className="graph-svg" viewBox="0 0 400 100" preserveAspectRatio="none">
        <path className="graph-grid" d="M0 25 L400 25 M0 50 L400 50 M0 75 L400 75" />
        <path className="graph-path-spd" d={path} />
        <text className="graph-lbl" x="0" y="20">30m/s</text>
        <text className="graph-lbl" x="0" y="95">0m/s</text>
      </svg>
    );
  };

  return (
    <>
      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fdfcfb; font-family: 'DM Sans', sans-serif; color: #1a1a1a; }
        
        .dash { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

        /* --- Header --- */
        .hdr { display: flex; align-items: center; justify-content: space-between; height: 60px; padding: 0 24px; border-bottom: 1px solid #e5e5e5; background: #fff; flex-shrink: 0; }
        
        .hdr-left { display: flex; align-items: center; gap: 24px; }
        .hdr-logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 18px; letter-spacing: -0.02em; cursor: pointer; }
        .hdr-div { width: 1px; height: 28px; background: #e5e5e5; }
        .hdr-status { display: flex; flex-direction: column; justify-content: center; }
        .hdr-status-lbl { font-size: 9px; font-weight: 700; color: #8a8a8a; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }
        .hdr-status-val { font-size: 13px; font-weight: 700; }

        .hdr-center { display: flex; align-items: center; gap: 32px; }
        .hdr-tab { font-size: 12px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: color 0.15s; }
        .hdr-tab.active { color: #1a1a1a; box-shadow: 0 2px 0 #1a1a1a; padding-bottom: 20px; transform: translateY(10px); }
        .hdr-tab:hover { color: #1a1a1a; }

        .hdr-right { display: flex; align-items: center; gap: 16px; }
        .hdr-sys { display: flex; align-items: center; gap: 6px; background: #ecfdf5; border: 1px solid #d1fae5; padding: 6px 12px; border-radius: 99px; font-size: 10px; font-weight: 700; color: #059669; }
        .hdr-sys-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; }
        .hdr-icon { color: #5a5a5a; cursor: pointer; transition: color 0.15s; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; }
        .hdr-icon:hover { background: #f3f4f6; color: #1a1a1a; }
        .hdr-user { width: 32px; height: 32px; border-radius: 50%; background: #1a1a1a; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; cursor: pointer; }

        /* --- Main body --- */
        .mn { display: flex; flex: 1; overflow: hidden; background: #f4f4f5; padding: 10px 16px 0 16px; gap: 16px; }
        
        /* --- Left sidebar --- */
        .side { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; padding-bottom: 24px; }
        .side::-webkit-scrollbar { display: none; }
        
        .s-card { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e5e5e5; }
        .s-lbl-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .s-lbl { font-size: 10px; font-weight: 700; color: #8a8a8a; letter-spacing: 0.08em; text-transform: uppercase; }
        
        .s-val-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
        .s-val { font-size: 32px; font-weight: 800; line-height: 1; }
        .s-sub { font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 4px; }
        
        .bar-bg { height: 4px; background: #f3f4f6; border-radius: 4px; overflow: hidden; position: relative; }
        .bar-fill { height: 100%; border-radius: 4px; position: absolute; left: 0; top: 0; }

        .fl-lbl { font-size: 10px; font-weight: 700; color: #8a8a8a; letter-spacing: 0.08em; text-transform: uppercase; margin: 8px 0 4px; }
        .fl-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; margin-bottom: 8px; }
        .fl-name { font-size: 12px; font-weight: 700; }
        .fl-stat { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; letter-spacing: 0.05em; }

        /* --- Center --- */
        .cnt { flex: 1; display: flex; flex-direction: column; min-width: 0; gap: 20px; overflow-y: auto; padding-bottom: 24px; }
        .cnt::-webkit-scrollbar { display: none; }
        
        /* --- Grid layout --- */
        .mission-grid { display: grid; grid-template-columns: 1.5fr 1fr; grid-template-rows: auto auto auto auto; gap: 16px; flex: 1; min-height: 0; }
        .vid-wrap { width: 100%; height: 600px; background: #000; border-radius: 16px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); grid-row: 1 / 5; }
        .vid-img { width: 100%; height: 100%; object-fit: cover; opacity: 1; }


        
        .v-over-top { position: absolute; top: 24px; left: 24px; display: flex; flex-direction: column; gap: 12px; }
        .v-badge-row { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); padding: 8px 16px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; }
        .v-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 8px rgba(239, 68, 68, 0.8); animation: pulse 2s infinite; }
        .v-live { color: #1a1a1a; display: flex; align-items: center; gap: 8px; }
        .v-sep { width: 2px; height: 12px; background: #ccc; }
        .v-coords { color: #5a5a5a; }
        
        .v-stats { display: flex; align-items: center; gap: 16px; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); padding: 8px 16px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #5a5a5a; }
        
        .v-controls { position: absolute; bottom: 24px; right: 24px; display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.9); padding: 6px; border-radius: 12px; backdrop-filter: blur(4px); }
        .vc-btn { width: 40px; height: 40px; border-radius: 8px; background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #1a1a1a; transition: all 0.15s; }
        .vc-btn:hover { background: #f3f4f6; }
        .vc-btn.rec { background: #ef4444; color: #fff; border-radius: 8px; }
        
        .p-over-fill { height: 100%; background: #1a1a1a; width: 0%; border-radius: 2px; }
        
        .grid-full { grid-column: span 2; }
      
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        .bot-row { display: contents; }

        
        .b-card { background: #fff; border-radius: 12px; border: 1px solid #e5e5e5; display: flex; flex-direction: column; overflow: hidden; position: relative; }
        .b-lbl { padding: 16px 20px; font-size: 10px; font-weight: 800; color: #8a8a8a; letter-spacing: 0.1em; text-transform: uppercase; display: flex; align-items: center; justify-content: space-between; }
        
        /* Map card */
        .map-wrap { position: relative; flex: 1; background: #e5e5e5; }
        .map-img { width: 100%; height: 100%; object-fit: cover; }
        .map-tag { position: absolute; top: -30px; right: 16px; background: #1a1a1a; color: #fff; font-size: 9px; font-weight: 800; padding: 4px 8px; border-radius: 4px; }

        /* Perf card */
        .p-body { padding: 0 20px 20px; display: flex; flex-direction: column; gap: 24px; flex: 1; }
        .p-prog { display: flex; flex-direction: column; gap: 10px; }
        .p-prog-top { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #5a5a5a; }
        .p-bar { height: 6px; background: #f3f4f6; border-radius: 6px; overflow: hidden; }
        .p-fill { height: 100%; background: #1a1a1a; width: 0%; border-radius: 6px; }
        
        .p-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .p-box { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; justify-content: center; gap: 4px; }
        .p-box-lbl { font-size: 10px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; }
        .p-box-val { font-size: 20px; font-weight: 800; display: flex; align-items: baseline; gap: 2px; }
        .p-box-unit { font-size: 14px; font-weight: 600; color: #5a5a5a; }

        /* Act logs */
        .log-body { padding: 0 20px 20px; display: flex; flex-direction: column; gap: 12px; overflow-y: scroll; min-height: 250px; max-height: 350px; scrollbar-width: thin; scrollbar-color: #1a1a1a #f3f4f6; }
        .log-body::-webkit-scrollbar { width: 6px; }
        .log-body::-webkit-scrollbar-track { background: #f3f4f6; }
        .log-body::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        .log-item { display: flex; align-items: flex-start; gap: 16px; animation: fadeInLog 0.3s ease-out; padding: 4px 0; border-bottom: 1px solid #f9fafb; }
        @keyframes fadeInLog { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .log-time { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8a8a8a; font-weight: 700; min-width: 75px; }
        .log-content { display: flex; flex-direction: column; gap: 2px; }
        .log-badge { font-size: 9px; font-weight: 800; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; }
        .log-desc { font-size: 12px; font-weight: 600; color: #333; line-height: 1.4; }

        /* --- Footer --- */
        .ft { display: flex; align-items: center; justify-content: space-between; height: 36px; padding: 0 24px; background: #fbfbfc; border-top: 1px solid #e5e5e5; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #5a5a5a; flex-shrink: 0; }
        .ft-l { display: flex; gap: 24px; }
        .ft-str { color: #1a1a1a; }
        .ft-r { display: flex; gap: 24px; align-items: center; }
        .ft-stat { display: flex; align-items: center; gap: 6px; }
        
        /* --- Analytics Specific --- */
        .ana-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; padding-bottom: 24px; }
        .ana-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .ana-card-full { grid-column: 1 / -1; }
        .ana-h3 { font-size: 14px; font-weight: 800; color: #8a8a8a; letter-spacing: 0.1em; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
        .ana-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 8px; }
        .ana-stat-item { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 20px; text-align: center; }
        .ana-stat-lbl { font-size: 10px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; margin-bottom: 4px; display: block; }
        .ana-stat-val { font-size: 24px; font-weight: 800; }
        
        .graph-svg { width: 100%; height: 200px; overflow: visible; }
        .graph-path-batt { fill: none; stroke: #10b981; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
        .graph-path-alt { fill: rgba(59, 130, 246, 0.1); stroke: #3b82f6; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
        .graph-path-spd { fill: none; stroke: #f59e0b; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
        .graph-grid { stroke: #f3f4f6; stroke-width: 1; }
        .graph-axis { stroke: #e5e5e5; stroke-width: 1.5; }
        .graph-lbl { font-size: 9px; fill: #8a8a8a; font-weight: 700; }

        /* --- Stepper --- */
        .step-row { display: flex; align-items: center; justify-content: space-between; position: relative; padding: 0 10px; margin-bottom: 24px; }
        .step-line { position: absolute; top: 12px; left: 40px; right: 40px; height: 2px; background: #e5e5e5; z-index: 0; }
        .step-it { display: flex; flex-direction: column; align-items: center; gap: 8px; position: relative; z-index: 1; min-width: 80px; }
        .step-dot { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #e5e5e5; background: #fff; display: flex; align-items: center; justify-content: center; }
        .step-it.complete .step-dot { border-color: #1a1a1a; background: #1a1a1a; color: #fff; }
        .step-it.current .step-dot { border-color: #1a1a1a; background: #fff; color: #1a1a1a; }
        .step-it.current .step-dot::after { content: ''; width: 8px; height: 8px; background: #1a1a1a; border-radius: 50%; animation: pulse 1.5s infinite; }
        .step-it.pending .step-dot { opacity: 0.6; }
        .step-lbl-t { font-size: 8px; font-weight: 800; color: #8a8a8a; letter-spacing: 0.05em; }
        .step-it.complete .step-lbl-t { color: #1a1a1a; }
        .step-time { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #ccc; }

        /* --- Reports --- */
        .rep-grid { display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 800px; margin: 0 auto; padding-top: 20px; }
        .rep-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px; display: flex; align-items: center; justify-content: space-between; }
        .rep-info { display: flex; flex-direction: column; gap: 4px; }
        .rep-title { font-size: 14px; font-weight: 700; }
        .rep-meta { font-size: 11px; color: #8a8a8a; font-weight: 600; }
        .rep-btn { padding: 10px 20px; background: #1a1a1a; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .rep-btn:hover { background: #333; }
        
        /* --- Modal/Overlay --- */
        .modal-ov { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
        .modal-c { background: #fff; border-radius: 20px; padding: 40px; width: 100%; max-width: 440px; text-align: center; border: 1px solid #e5e5e5; box-shadow: 0 30px 60px rgba(0,0,0,0.1); }
        .asm-badge { font-family: 'JetBrains Mono', monospace; font-size: 10px; background: #f3f4f6; color: #5a5a5a; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.1em; display: inline-block; margin-bottom: 24px; border: 1px solid #e5e5e5; }
        .key-box { margin-top: 24px; background: #f9fafb; border: 2px dashed #e5e5e5; padding: 20px; border-radius: 12px; font-family: 'JetBrains Mono', monospace; }
        .key-val { font-size: 18px; font-weight: 700; letter-spacing: 0.1em; color: #1a1a1a; }
        .key-lbl { font-size: 9px; font-weight: 800; color: #8a8a8a; margin-bottom: 8px; text-transform: uppercase; }

        /* --- Full Screen Modal --- */
        .fs-modal { position: fixed; inset: 0; background: #000; z-index: 2000; display: flex; flex-direction: column; }
        .fs-hdr { position: absolute; top: 0; left: 0; right: 0; height: 80px; background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); z-index: 10; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; color: #fff; }
        .fs-close { width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .fs-close:hover { background: rgba(255,255,255,0.2); }
        .fs-video { width: 100%; height: 100%; object-fit: contain; }
        .fs-stats { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); backdrop-filter: blur(12px); padding: 16px 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2); color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 14px; letter-spacing: 0.05em; display: flex; gap: 40px; }
      `}</style>




      <div className="dash">
        <header className="hdr">
          <div className="hdr-left">
            <div className="hdr-logo" onClick={() => router.push('/dashboard')}>
              {IC.shield} Trinetra
            </div>
            <div className="hdr-div" />
            <div className="hdr-status">
              <span className="hdr-status-lbl">Mission Status</span>
              <span className="hdr-status-val">OPERATION SENTINEL - ALPHA</span>
            </div>
          </div>

          <div className="hdr-center">
            <div className={`hdr-tab${activeTab === "Missions" ? " active" : ""}`} onClick={() => setActiveTab("Missions")}>Missions</div>
            <div className="hdr-tab">Fleet</div>
            <div className={`hdr-tab${activeTab === "Analytics" ? " active" : ""}`} onClick={() => setActiveTab("Analytics")}>Analytics</div>
            <div className={`hdr-tab${activeTab === "Reports" ? " active" : ""}`} onClick={() => setActiveTab("Reports")}>Reports</div>
          </div>


          <div className="hdr-right">
            <div className="hdr-sys">
              <div className="hdr-sys-dot" /> SYSTEM: STABLE
            </div>
            <div className="hdr-icon">{IC.bell}</div>
            <div className="hdr-icon">{IC.settings}</div>
            <div className="hdr-user">KR</div>
          </div>
        </header>

        <div className="mn">
          <aside className="side">
            <div className="s-card">
              <div className="s-lbl-row">
                <span className="s-lbl">Humans Detected</span>
                <span style={{ color: '#1a1a1a' }}>{IC.userSearch}</span>
              </div>
              <div className="s-val-row">
                <span className="s-val">{humanCount}</span>
                <span className="v-sep" style={{ background: '#e5e5e5', height: '16px', margin: '0 8px' }} />
                <span className="s-sub" style={{ color: humanCount > 0 ? '#ef4444' : '#059669' }}>
                  {humanCount > 0 ? "LIVE DETECTION" : "AREA CLEAR"}
                </span>
              </div>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: `${Math.min(100, humanCount * 10)}%`, background: humanCount > 0 ? '#ef4444' : '#1a1a1a' }} />
              </div>
              
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #e5e5e5' }}>
                <span className="s-lbl" style={{ marginBottom: '8px', display: 'block' }}>Detection Model</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setSelectedModel("WALDO30-Y8M")}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, border: '1px solid #e5e5e5', background: selectedModel === "WALDO30-Y8M" ? '#1a1a1a' : '#fff', color: selectedModel === "WALDO30-Y8M" ? '#fff' : '#8a8a8a', cursor: 'pointer', transition: '0.2s' }}>
                    WALDO30-Y8M
                  </button>
                  <button 
                    onClick={() => setSelectedModel("YOLOv8m")}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, border: '1px solid #e5e5e5', background: selectedModel === "YOLOv8m" ? '#1a1a1a' : '#fff', color: selectedModel === "YOLOv8m" ? '#fff' : '#8a8a8a', cursor: 'pointer', transition: '0.2s' }}>
                    YOLOv8m
                  </button>
                  <button 
                    onClick={() => setSelectedModel("version3")}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, border: '1px solid #e5e5e5', background: selectedModel === "version3" ? '#1a1a1a' : '#fff', color: selectedModel === "version3" ? '#fff' : '#8a8a8a', cursor: 'pointer', transition: '0.2s' }}>
                    Version3
                  </button>
                </div>
              </div>
            </div>

            <div className="s-card">
              <div className="s-lbl-row">
                <span className="s-lbl">Medikits Delivered</span>
                <span style={{ color: '#059669' }}>{IC.kit}</span>
              </div>
              <div className="s-val-row">
                <span className="s-val">{10 - telemetry.movesLeft}</span>
                <span className="s-sub" style={{ color: '#059669' }}>{(((10 - telemetry.movesLeft) / 10) * 100).toFixed(0)}% Success</span>
              </div>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: `${((10 - telemetry.movesLeft) / 10) * 100}%`, background: '#10b981' }} />
              </div>
            </div>

            <div className="s-card">
              <div className="s-lbl-row">
                <span className="s-lbl">Battery Health</span>
                <span style={{ color: '#10b981' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect><line x1="22" y1="11" x2="22" y2="13"></line></svg>
                </span>
              </div>
              <div className="s-val-row">
                <span className="s-val">{telemetry.batt.toFixed(1)}%</span>
                <span className="s-sub" style={{ color: '#5a5a5a' }}>{telemetry.voltage.toFixed(2)}V</span>
              </div>
              <div className="bar-bg">
                <div className="bar-fill" style={{ 
                  width: '100%', 
                  background: '#10b981' 
                }} />
              </div>
            </div>

            <div className="s-card">
              <div className="s-lbl-row">
                <span className="s-lbl">Total Payload</span>
                <span style={{ color: '#d97706' }}>{IC.payload}</span>
              </div>
              <div className="s-val-row">
                <span className="s-val">{((telemetry.movesLeft / 10) * 100).toFixed(0)}%</span>
                <span className="s-sub" style={{ color: '#3b82f6' }}>{(telemetry.movesLeft * 0.5).toFixed(1)}kg Remaining</span>
              </div>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: `${(telemetry.movesLeft / 10) * 100}%`, background: '#f59e0b' }} />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="fl-lbl">Operational Intelligence</div>
              <button 
                className="rep-btn" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '11px', padding: '12px' }}
                onClick={handleDownloadReport}
                disabled={isGeneratingReport}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {isGeneratingReport ? "ENCRYPTING..." : "DOWNLOAD ENCRYPTED REPORT"}
              </button>
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="fl-lbl">Fleet Status</div>
              <div className="fl-item">
                <span className="fl-name">UAV-01</span>
                <span className="fl-stat" style={{ background: '#ecfdf5', color: '#059669' }}>ONLINE</span>
              </div>
              <div className="fl-item">
                <span className="fl-name">UAV-02</span>
                <span className="fl-stat" style={{ background: '#f3f4f6', color: '#6b7280' }}>STANDBY</span>
              </div>
            </div>

            {/* Mission Images Gallery */}
            <div style={{ marginTop: 16 }}>
              <div className="fl-lbl">Captured Intelligence ({detectionsList.length})</div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '8px', 
                marginTop: '8px',
                maxHeight: '300px',
                overflowY: 'auto',
                paddingRight: '4px'
              }}>
                {detectionsList.length > 0 ? detectionsList.map((img, idx) => (
                  <div key={idx} style={{ 
                    position: 'relative', 
                    aspectRatio: '1', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    border: '1px solid #e5e5e5',
                    cursor: 'pointer'
                  }} onClick={() => window.open(`http://localhost:8000${img.url}`, '_blank')}>
                    <img 
                      src={`http://localhost:8000${img.url}`} 
                      alt={img.filename}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      right: 0, 
                      background: 'rgba(0,0,0,0.6)', 
                      color: '#fff', 
                      fontSize: '8px', 
                      padding: '2px 4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {img.filename.split('_').slice(-2).join('_').replace('.jpg', '')}
                    </div>
                  </div>
                )) : (
                  <div style={{ 
                    gridColumn: 'span 2', 
                    padding: '20px', 
                    background: '#f9fafb', 
                    borderRadius: '8px', 
                    textAlign: 'center', 
                    fontSize: '11px', 
                    color: '#8a8a8a',
                    border: '1px dashed #e5e5e5' 
                  }}>
                    No signatures captured yet.
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="cnt">
            {activeTab === "Missions" ? (
              <>
                <div className="s-card" style={{ marginBottom: 0, padding: '24px 20px 16px' }}>
                  <div className="step-row">
                    <div className="step-line" />
                    {missionStages.map((s, i) => (
                      <div key={i} className={`step-it ${s.status}`}>
                        <div className="step-dot">
                          {s.status === 'complete' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </div>
                        <span className="step-lbl-t">{s.label}</span>
                        <span className="step-time">{s.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mission-grid">
                  <div className="vid-wrap" onClick={() => setIsFullScreen(true)} style={{ cursor: 'zoom-in' }}>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      onLoadedMetadata={() => videoRef.current?.play().catch(() => {})}
                      className="vid-img" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                      }} 
                    />

                    {/* Camera Offline / Error Overlay */}
                    {cameraStatus === "error" && (
                      <div 
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(10,10,10,0.92)',
                          backdropFilter: 'blur(8px)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          padding: '24px',
                          textAlign: 'center',
                          zIndex: 20
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ color: '#ef4444', fontSize: '32px' }}>⚠️</div>
                        <div style={{ color: '#fff', fontSize: '13px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
                          CAMERA FEED OFFLINE
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: '11px', maxWidth: '400px', lineHeight: 1.5 }}>
                          {cameraError || "Camera feed could not be initialized."}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {availableCameras.length > 0 && (
                            <select
                              value={selectedCameraId}
                              onChange={(e) => {
                                const newId = e.target.value;
                                setSelectedCameraId(newId);
                                startCamera(newId);
                              }}
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                fontFamily: 'JetBrains Mono, monospace',
                                background: '#1a1a1a',
                                color: '#38bdf8',
                                border: '1px solid #38bdf8',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              {availableCameras.map(cam => (
                                <option key={cam.deviceId} value={cam.deviceId}>
                                  📹 {cam.label}
                                </option>
                              ))}
                            </select>
                          )}
                          <button
                            onClick={() => startCamera(selectedCameraId)}
                            style={{
                              background: '#10b981',
                              color: '#000',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 16px',
                              fontSize: '10px',
                              fontWeight: 800,
                              fontFamily: 'JetBrains Mono, monospace',
                              cursor: 'pointer'
                            }}
                          >
                            🔄 RETRY CAMERA
                          </button>
                        </div>
                      </div>
                    )}
                    <svg
                      viewBox={`0 0 ${videoSize.w} ${videoSize.h}`}
                      preserveAspectRatio="xMidYMid slice"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 5
                      }}
                    >
                      {latestDetections.map((d, i) => (
                        <g key={i}>
                          <rect
                            x={d.x}
                            y={d.y}
                            width={d.w}
                            height={d.h}
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth={videoSize.w / 250}
                          />
                          <text
                            x={d.x}
                            y={d.y - (videoSize.w / 150)}
                            fill="#22c55e"
                            fontSize={videoSize.w / 50}
                            fontWeight="bold"
                            style={{ textShadow: "1px 1px 2px black" }}
                          >
                            {`Person ${(d.conf * 100).toFixed(0)}%`}
                          </text>
                        </g>
                      ))}
                    </svg>
                    <div className="v-over-top">
                      <div className="v-badge-row">
                        <div className="v-live"><div className="v-dot" /> {IC.video} LIVE</div>
                        <div className="v-sep" />
                        <div className="v-live">UAV-01</div>
                        <div className="v-sep" />
                        <div className="v-coords">
                          {Math.abs(telemetry?.lat ?? 0).toFixed(6)}° {telemetry.lat >= 0 ? 'N' : 'S'}, {Math.abs(telemetry?.lng ?? 0).toFixed(6)}° {telemetry.lng >= 0 ? 'E' : 'W'}
                          <span style={{ marginLeft: '10px', opacity: 0.7 }}>HDOP: {telemetry.hdop.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="v-stats">
                        {telemetry.alt > 0 && <>ALT: {telemetry.alt.toFixed(0)}m <span className="v-sep" style={{ background: '#e5e5e5' }} /> </>}
                        {telemetry.vel > 0 && <>VEL: {telemetry.vel.toFixed(1)}m/s <span className="v-sep" style={{ background: '#e5e5e5' }} /> </>}
                        BATT: {(telemetry.batt || 0).toFixed(1)}% <span className="v-sep" style={{ background: '#e5e5e5' }} />
                        HLTH: {telemetry.health.toFixed(1)}%
                      </div>
                    </div>

                    <div className="p-overlay">
                      <div className="p-over-card p-over-big">
                        <span className="p-over-lbl">Mission Progress</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span className="p-over-val">0%</span>
                          <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.6 }}>BATT HLTH: {telemetry.health.toFixed(1)}%</span>
                        </div>
                        <div className="p-over-prog"><div className="p-over-fill" /></div>
                      </div>
                    </div>


                    <div className="v-controls">
                      {availableCameras.length > 0 && (
                        <select
                          value={selectedCameraId}
                          onChange={(e) => {
                            const newId = e.target.value;
                            setSelectedCameraId(newId);
                            startCamera(newId);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            fontFamily: 'JetBrains Mono, monospace',
                            background: '#fff',
                            color: '#1a1a1a',
                            border: '1px solid #e5e5e5',
                            borderRadius: '6px',
                            padding: '4px 6px',
                            outline: 'none',
                            cursor: 'pointer',
                            maxWidth: '140px',
                            textOverflow: 'ellipsis'
                          }}
                          title="Select Camera / Capture Device"
                        >
                          {availableCameras.map(cam => (
                            <option key={cam.deviceId} value={cam.deviceId}>
                              📹 {cam.label}
                            </option>
                          ))}
                        </select>
                      )}
                      <button 
                        className="vc-btn" 
                        onClick={(e) => { e.stopPropagation(); startCamera(selectedCameraId); }} 
                        title="Reconnect Camera"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                      </button>
                      <button className="vc-btn">{IC.zoomIn}</button>
                      <button className="vc-btn">{IC.zoomOut}</button>
                      <div className="v-sep" style={{ margin: '0 4px', height: '24px' }} />
                      <button className="vc-btn" onClick={(e) => { e.stopPropagation(); setIsFullScreen(true); }}>{IC.expand}</button>
                      <button className="vc-btn rec">{IC.record}</button>
                    </div>
                  </div>

                  <div className="b-card">
                    <div className="b-lbl">
                      Tactical GPS
                      <div className="map-tag">REAL-TIME</div>
                    </div>
                    <div className="map-wrap" style={{ minHeight: '220px' }}>
                      <MapComponent 
                        lat={(telemetry.lat === 0 && pcLocation?.lat) ? pcLocation.lat : telemetry.lat} 
                        lng={(telemetry.lng === 0 && pcLocation?.lng) ? pcLocation.lng : telemetry.lng} 
                        pcLat={pcLocation?.lat} 
                        pcLng={pcLocation?.lng} 
                      />
                    </div>
                  </div>

                  <div className="b-card" style={{ border: '1px solid #1f2937' }}>
                    <div className="b-lbl" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', borderBottom: '1px solid #1f2937' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                        Serial Console
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select 
                          value={selectedPort} 
                          onChange={(e) => setSelectedPort(e.target.value)}
                          style={{
                            fontSize: '9px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #10b981', background: '#000', color: '#10b981', fontFamily: 'JetBrains Mono, monospace', outline: 'none', cursor: 'pointer'
                          }}
                        >
                          <option value="">Select COM Port</option>
                          {availablePorts.map(p => (
                            <option key={p.port} value={p.port}>{p.port}</option>
                          ))}
                        </select>
                        <button 
                          onClick={handleConnectPort}
                          disabled={portConnecting}
                          style={{
                            background: '#10b981', color: '#000', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '9px', fontWeight: 800, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', transition: '0.2s', opacity: portConnecting ? 0.7 : 1
                          }}
                        >
                          {portConnecting ? 'CONNECTING...' : 'CONNECT'}
                        </button>
                      </div>
                    </div>
                    <div 
                      ref={rawTerminalRef}
                      style={{ 
                        flex: 1, background: '#0a0a0a', color: '#10b981', fontFamily: 'JetBrains Mono, monospace', 
                        fontSize: '10px', padding: '12px', overflowY: 'auto', height: '220px',
                        display: 'flex', flexDirection: 'column', gap: '2px',
                        scrollbarWidth: 'thin', scrollbarColor: '#10b981 #0a0a0a'
                      }}
                    >
                      <div style={{ color: '#4b5563', marginBottom: '8px', borderBottom: '1px dashed #374151', paddingBottom: '8px' }}>
                        {"// RAW SERIAL COM STREAM DETECTED"}
                        <br />
                        {"// FORMAT: MAC_ADDRESS STATUS LAT LON MOVES_LEFT"}
                      </div>
                      {rawSerialLogs.length > 0 ? rawSerialLogs.map((log, idx) => (
                        <div key={idx} style={{ wordBreak: 'break-all' }}>{log}</div>
                      )) : (
                        <div style={{ opacity: 0.5 }}>WAITING FOR SERIAL DATA...</div>
                      )}
                    </div>
                  </div>

                  {/* Feed OSD Console — reads text from live camera feed */}
                  <div className="b-card" style={{ border: '1px solid #1f2937' }}>
                    <div className="b-lbl" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', borderBottom: '1px solid #1f2937' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        Feed Console
                      </div>
                      <div style={{
                        fontSize: '9px', padding: '3px 8px', borderRadius: '4px', border: '1px solid #38bdf8', background: '#000', color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800
                      }}>
                        OSD / OCR
                      </div>
                    </div>
                    <div 
                      ref={osdTerminalRef}
                      style={{ 
                        flex: 1, background: '#0a0a0a', color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace', 
                        fontSize: '10px', padding: '12px', overflowY: 'auto', height: '220px',
                        display: 'flex', flexDirection: 'column', gap: '2px',
                        scrollbarWidth: 'thin', scrollbarColor: '#38bdf8 #0a0a0a'
                      }}
                    >
                      <div style={{ color: '#4b5563', marginBottom: '8px', borderBottom: '1px dashed #374151', paddingBottom: '8px' }}>
                        {"// LIVE FEED OSD TEXT EXTRACTION"}
                        <br />
                        {"// SOURCE: CAMERA FRAME OCR ANALYSIS"}
                      </div>
                      {osdLogs.length > 0 ? osdLogs.map((log, idx) => (
                        <div key={idx} style={{ wordBreak: 'break-all' }}>{log}</div>
                      )) : (
                        <div style={{ opacity: 0.5 }}>WAITING FOR FEED DATA...</div>
                      )}
                    </div>
                  </div>

                  <div className="b-card">
                    <div className="b-lbl">Performance</div>
                    <div className="p-body">
                      <div className="p-prog">
                        <div className="p-prog-top">
                          <span>MISSION PROGRESS</span>
                          <span style={{ color: '#1a1a1a' }}>0%</span>
                        </div>
                        <div className="p-bar"><div className="p-fill" /></div>
                      </div>
                      <div className="p-grid">
                        <div className="p-box" onClick={() => setActiveTab("Analytics")} style={{ cursor: 'pointer' }}>
                          <span className="p-box-lbl">Dist Covered</span>
                          <span className="p-box-val">{distance.toFixed(3)}<span className="p-box-unit">km</span></span>
                        </div>
                        <div className="p-box" onClick={() => setActiveTab("Analytics")} style={{ cursor: 'pointer' }}>
                          <span className="p-box-lbl">Elapsed</span>
                          <span className="p-box-val">00:00:00</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="b-card grid-full" style={{ minHeight: '300px' }}>
                    <div className="b-lbl" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Activity Logs
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="vc-btn" 
                          style={{ width: 'auto', height: '24px', fontSize: '9px', padding: '0 8px', gap: '4px' }}
                          onClick={handleDownloadReport}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          EXPORT ENCRYPTED PDF
                        </button>
                        <div className="map-tag" style={{ position: 'static' }}>LIVE</div>
                      </div>
                    </div>
                    <div className="log-body" ref={logBodyRef}>
                      {logs.map((log, idx) => (
                        <div className="log-item" key={idx}>
                          <div className="log-time">{log.time}</div>
                          <div className="log-content">
                            <span className="log-badge" style={{ color: log.color }}>{log.type}</span>
                            <span className="log-desc">{log.msg}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </>


            ) : activeTab === "Analytics" ? (
              <div className="ana-grid fu">
                <div className="ana-card ana-card-full">
                  <div className="ana-h3">Tactical Performance Summary</div>
                  <div className="ana-stats-row">
                    <div className="ana-stat-item">
                      <span className="ana-stat-lbl">Average Speed</span>
                      <span className="ana-stat-val">12.8 <small style={{fontSize: 12, opacity: 0.6}}>m/s</small></span>
                    </div>
                    <div className="ana-stat-item">
                      <span className="ana-stat-lbl">Peak Altitude</span>
                      <span className="ana-stat-val">152 <small style={{fontSize: 12, opacity: 0.6}}>m</small></span>
                    </div>
                    <div className="ana-stat-item">
                      <span className="ana-stat-lbl">Detection Accuracy</span>
                      <span className="ana-stat-val">96.4 <small style={{fontSize: 12, opacity: 0.6}}>%</small></span>
                    </div>
                    <div className="ana-stat-item">
                      <span className="ana-stat-lbl">Signal Stability</span>
                      <span className="ana-stat-val">99.1 <small style={{fontSize: 12, opacity: 0.6}}>%</small></span>
                    </div>
                  </div>
                </div>

                <div className="ana-card">
                  <div className="ana-h3">Battery Discharge Profile</div>
                  <BatteryGraph />
                </div>

                {telemetry.alt > 0 && (
                  <div className="ana-card">
                    <div className="ana-h3">Altitude Profile (MSL)</div>
                    <AltitudeGraph />
                  </div>
                )}

                {telemetry.vel > 0 && (
                  <div className="ana-card">
                    <div className="ana-h3">Velocity Variations</div>
                    <SpeedGraph />
                  </div>
                )}

                <div className="ana-card">
                  <div className="ana-h3">Human Detections / Min</div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', border: '1px dashed #e5e5e5', borderRadius: '12px', fontSize: 11, color: '#8a8a8a', fontWeight: 700 }}>
                    HEATMAP DATA PROCESSING...
                  </div>
                </div>
              </div>
            ) : (
              <div className="rep-grid fu">
                <div className="ana-card ana-card-full">
                  <div className="ana-h3">Tactical Report Generation</div>
                  <p style={{fontSize: '12px', color: '#666', marginTop: '-10px'}}>Generate ASM-32 encrypted mission intelligence reports for offline transmission.</p>
                </div>

                <div className="rep-card fu d1">
                  <div className="rep-info">
                    <span className="rep-title">Full Mission Intelligence Log [LIVE]</span>
                    <span className="rep-meta">PDF • 14.2 MB • GENERATED: JUST NOW</span>
                  </div>
                  <button className="rep-btn" onClick={handleDownloadReport}>
                    {isGeneratingReport ? "CRYPTO-PROCESS..." : "GENERATE ENCRYPTED PDF"}
                  </button>
                </div>

                <div className="rep-card fu d2" style={{opacity: 0.6}}>
                  <div className="rep-info">
                    <span className="rep-title">Previous Operational Summary [ARCHIVED]</span>
                    <span className="rep-meta">PDF • 8.1 MB • DATE: 2024-05-19</span>
                  </div>
                  <button className="rep-btn" disabled>DOWNLOAD ARCHIVE</button>
                </div>

                <div className="ana-card ana-card-full" style={{marginTop: '20px'}}>
                  <div className="ana-h3">Tactical Intelligence Vault</div>
                  <p style={{fontSize: '12px', color: '#666', marginTop: '-10px'}}>Decrypt and view secure operational reports.</p>
                  
                  <div style={{display: 'flex', gap: '16px', marginTop: '10px'}}>
                    <div style={{flex: 1}}>
                      <label style={{fontSize: '10px', fontWeight: 700, color: '#8a8a8a', display: 'block', marginBottom: '8px'}}>ASM-32 DECRYPTION KEY</label>
                      <input 
                        type="text" 
                        placeholder="TRN-ASM32-XXXX-XXXX"
                        value={decryptionKeyInput}
                        onChange={(e) => setDecryptionKeyInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #e5e5e5',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '13px',
                          outline: 'none',
                          background: '#f9fafb'
                        }}
                      />
                    </div>
                    <div style={{display: 'flex', alignItems: 'flex-end'}}>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{display: 'none'}} 
                        accept=".aes"
                        onChange={handleDecryptReport}
                      />
                      <button 
                        className="rep-btn" 
                        style={{height: '45px', display: 'flex', alignItems: 'center', gap: '8px'}}
                        onClick={() => {
                          if (!decryptionKeyInput) {
                            alert("Please enter the decryption key first.");
                            return;
                          }
                          fileInputRef.current?.click();
                        }}
                        disabled={isDecrypting}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3y-3.5-3.5z"/></svg>
                        {isDecrypting ? "DECRYPTING..." : "SELECT & DECRYPT FILE"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>


        </div>

        <footer className="ft">
          <div className="ft-l">
            <span className="ft-str">Trinetra V4.2.0</span>
            <span>TERMINAL: HK-9821-X</span>
          </div>
          <div className="ft-r">
            <div className="ft-stat">
              <div className="v-dot" style={{ background: '#10b981', boxShadow: 'none' }} /> SATELLITE: LINKED
            </div>
            <div className="ft-stat">
              <div className="v-dot" style={{ background: '#1a1a1a', boxShadow: 'none' }} /> ENCRYPTED
            </div>
            <span>2024-05-20 // 14:24:12 UTC</span>
          </div>
        </footer>
      </div>

      {encryptionKey && (
        <div className="modal-ov" onClick={() => setEncryptionKey(null)}>
          <div className="modal-c fu" onClick={e => e.stopPropagation()}>
            <div className="asm-badge">ASM-32 SECURE PROTOCOL</div>
            <div style={{color: '#10b981', marginBottom: '16px'}}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <h2 style={{fontSize: '20px', fontWeight: 800, marginBottom: '12px'}}>Report Download Started</h2>
            <p style={{fontSize: '13px', color: '#666', lineHeight: 1.5}}>The tactical intelligence report has been encrypted and is currently downloading.</p>
            
            <div className="key-box">
              <div className="key-lbl">DECRYPTION KEY (ASM-32)</div>
              <div className="key-val">{encryptionKey}</div>
            </div>
            
            <p style={{fontSize: '11px', color: '#ef4444', fontWeight: 700, marginTop: '20px'}}>IMPORTANT: Store this key securely. It is required to view the report.</p>
            
            <button className="rep-btn" style={{marginTop: '32px', width: '100%'}} onClick={() => setEncryptionKey(null)}>ACKNOWLEDGE</button>
          </div>
        </div>
      )}

      {isFullScreen && (
        <div className="fs-modal fu">
          <div className="fs-hdr">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="v-dot" />
              <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '0.1em' }}>UAV-01 TACTICAL FEED // LIVE</span>
            </div>
            <button className="fs-close" onClick={() => setIsFullScreen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <video 
            ref={fullScreenVideoRef}
            autoPlay 
            playsInline 
            muted 
            className="fs-video" 
          />

          <svg
            viewBox={`0 0 ${videoSize.w} ${videoSize.h}`}
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 5
            }}
          >
            {latestDetections.map((d, i) => (
              <g key={i}>
                <rect
                  x={d.x}
                  y={d.y}
                  width={d.w}
                  height={d.h}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth={videoSize.w / 250}
                />
                <text
                  x={d.x}
                  y={d.y - (videoSize.w / 150)}
                  fill="#22c55e"
                  fontSize={videoSize.w / 50}
                  fontWeight="bold"
                  style={{ textShadow: "1px 1px 2px black" }}
                >
                  {`Person ${(d.conf * 100).toFixed(0)}%`}
                </text>
              </g>
            ))}
          </svg>

          <div className="fs-stats">
            <div>ALT: <span style={{ color: '#aaa' }}>{telemetry.alt.toFixed(0)}M</span></div>
            <div>VEL: <span style={{ color: '#aaa' }}>{telemetry.vel.toFixed(1)}M/S</span></div>
            <div>BATT: <span style={{ color: telemetry.batt < 20 ? '#ef4444' : '#10b981' }}>{telemetry.batt}% ({telemetry.voltage.toFixed(2)}V)</span></div>
            <div>COORDS: <span style={{ color: '#aaa' }}>{telemetry.lat.toFixed(4)}° N, {Math.abs(telemetry.lng).toFixed(4)}° W</span></div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {decryptedPdfUrl && (
        <div className="modal-ov" onClick={() => setDecryptedPdfUrl(null)}>
          <div className="modal-c fu" style={{maxWidth: '900px', width: '90%', height: '90vh', display: 'flex', flexDirection: 'column', padding: '0'}} onClick={e => e.stopPropagation()}>
            <div className="hdr" style={{flexShrink: 0, padding: '0 24px', borderRadius: '20px 20px 0 0'}}>
              <div className="hdr-logo">{IC.shield} Decrypted Tactical Intelligence</div>
              <button 
                onClick={() => setDecryptedPdfUrl(null)}
                style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#8a8a8a'}}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div style={{flex: 1, position: 'relative'}}>
              <iframe 
                src={decryptedPdfUrl} 
                style={{width: '100%', height: '100%', border: 'none', borderRadius: '0 0 20px 20px'}}
                title="Decrypted PDF"
              />
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>


  );
}
