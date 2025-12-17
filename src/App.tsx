import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import closeSfx from "../audio/close.wav";
import openSfx from "../audio/open.wav";

export default function App() {
   const openAudioRef = useRef<HTMLAudioElement | null>(null);
   const closeAudioRef = useRef<HTMLAudioElement | null>(null);
   const [isMaximized, setIsMaximized] = useState(false);

   useEffect(() => {
      openAudioRef.current = new Audio(openSfx);
      closeAudioRef.current = new Audio(closeSfx);
   }, []);

   const isOverlayWindow = useMemo(() => {
      const params = new URLSearchParams(window.location.search);
      return params.has("overlay");
   }, []);

   useEffect(() => {
      if (!isOverlayWindow) return;

      const previousHtmlBackground = document.documentElement.style.background;
      const previousBodyBackground = document.body.style.background;

      document.documentElement.style.background = "transparent";
      document.body.style.background = "transparent";

      return () => {
         document.documentElement.style.background = previousHtmlBackground;
         document.body.style.background = previousBodyBackground;
      };
   }, [isOverlayWindow]);

   const playSound = useCallback((audio: HTMLAudioElement | null) => {
      if (!audio) return;
      audio.currentTime = 0;
      audio.play().catch(() => {
         // Ignore autoplay errors (user gesture requirement, etc.)
      });
   }, []);

   const openOverlay = useCallback(() => {
      playSound(openAudioRef.current);
      window.overlay?.openOverlayWindow();
   }, [playSound]);

   const closeOverlay = useCallback(() => {
      playSound(closeAudioRef.current);
      // Wait briefly so the close sound can start before the window is destroyed.
      setTimeout(() => window.overlay?.closeOverlayWindow(), 120);
   }, [playSound]);

   const handleMinimize = useCallback(() => {
      window.windowControls?.minimize?.();
   }, []);

   const handleMaximize = useCallback(() => {
      window.windowControls?.toggleMaximize?.();
   }, []);

   const handleClose = useCallback(() => {
      window.windowControls?.close?.();
   }, []);

   useEffect(() => {
      if (!isOverlayWindow) return;

      const onKeyDown = (event: KeyboardEvent) => {
         if (event.key === "Escape") {
            closeOverlay();
         }
      };

      window.addEventListener("keydown", onKeyDown);
      return () => {
         window.removeEventListener("keydown", onKeyDown);
      };
   }, [isOverlayWindow, closeOverlay]);

   useEffect(() => {
      if (!window.windowControls) return;

      window.windowControls.isMaximized?.().then((max) => setIsMaximized(!!max));
      const unsubscribe = window.windowControls.onMaximizeChange?.((max) => setIsMaximized(!!max));

      return () => {
         if (typeof unsubscribe === "function") unsubscribe();
      };
   }, []);

   if (isOverlayWindow) {
      return (
         <div
            style={{
               position: "fixed",
               inset: 0,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               background: "rgba(15, 16, 18, 0.6)",
               backdropFilter: "blur(4px)",
               color: "#f6f7f9",
            }}
         >
            <button
               onClick={closeOverlay}
               aria-label="Close overlay"
               style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(0,0,0,0.35)",
                  color: "#fff",
                  fontSize: "20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               ×
            </button>
            <div
               style={{
                  padding: "2.5rem 3.5rem",
                  borderRadius: "20px",
                  background: "rgba(22,24,27,0.82)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
                  textAlign: "center",
                  maxWidth: "520px",
                  width: "90%",
               }}
            >
               <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Overlay</h2>
               <p style={{ margin: 0, opacity: 0.85 }}>Press Esc or click the X to close.</p>
            </div>
         </div>
      );
   }

   const controlButtonStyle: CSSProperties = {
      width: "34px",
      height: "26px",
      borderRadius: "6px",
      border: "1px solid #2a2d33",
      background: "#16171d",
      color: "#f1f3f5",
      cursor: "pointer",
      fontSize: "14px",
      lineHeight: 1,
      padding: 0,
   };

   return (
      <div
         style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            background: "#0f1012",
            color: "#f1f3f5",
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
         }}
      >
         <div
            style={
               {
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 12px",
                  borderBottom: "1px solid #1c1e24",
                  background: "#0b0c0f",
                  WebkitAppRegion: "drag",
                  userSelect: "none",
               } as CSSProperties
            }
         >
            <div style={{ fontWeight: 700, letterSpacing: "0.08em", fontSize: "0.9rem", textTransform: "uppercase" }}>
               Pluginject
            </div>
            <div style={{ display: "flex", gap: "8px", WebkitAppRegion: "no-drag" } as CSSProperties}>
               <button onClick={handleMinimize} style={controlButtonStyle}>
                  &#x2013;
               </button>
               <button onClick={handleMaximize} style={controlButtonStyle}>
                  {isMaximized ? "▭" : "▢"}
               </button>
               <button
                  onClick={handleClose}
                  style={{ ...controlButtonStyle, background: "#c23b3b", border: "1px solid #c23b3b" }}
               >
                  &#x2715;
               </button>
            </div>
         </div>

         <div
            style={{
               flex: 1,
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               justifyContent: "center",
               gap: "1rem",
            }}
         >
            <h1 style={{ margin: 0 }}>Pluginject</h1>
            <p style={{ opacity: 0.8, margin: 0 }}>Overlay demo</p>
            <button
               onClick={openOverlay}
               style={{
                  padding: "0.9rem 1.4rem",
                  borderRadius: "12px",
                  border: "1px solid #31343a",
                  background: "#1e2026",
                  color: "#f1f3f5",
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                  transition: "transform 120ms ease, box-shadow 120ms ease, background 120ms ease",
               }}
               onMouseDown={(e) => e.currentTarget.blur()}
               onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 14px 36px rgba(0,0,0,0.35)";
               }}
               onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.25)";
               }}
            >
               Open Overlay
            </button>
         </div>
      </div>
   );
}
