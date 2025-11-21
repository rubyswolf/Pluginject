import { useEffect, useMemo, useRef, useState } from "react";

import closeSfx from "../audio/close.wav";
import openSfx from "../audio/open.wav";

export default function App() {
   const [isOverlayOpen, setIsOverlayOpen] = useState(false);
   const openAudioRef = useRef<HTMLAudioElement | null>(null);
   const closeAudioRef = useRef<HTMLAudioElement | null>(null);

   useEffect(() => {
      openAudioRef.current = new Audio(openSfx);
      closeAudioRef.current = new Audio(closeSfx);
   }, []);

   useEffect(
      () => () => {
         window.overlay?.exitFullscreen();
      },
      []
   );

   const playSound = useMemo(
      () => (audio: HTMLAudioElement | null) => {
         if (!audio) return;
         audio.currentTime = 0;
         audio.play().catch(() => {
            // Ignore autoplay errors (user gesture requirement, etc.)
         });
      },
      []
   );

   const openOverlay = () => {
      setIsOverlayOpen(true);
      playSound(openAudioRef.current);
      window.overlay?.enterFullscreen();
   };

   const closeOverlay = () => {
      setIsOverlayOpen(false);
      playSound(closeAudioRef.current);
      window.overlay?.exitFullscreen();
   };

   useEffect(() => {
      if (!isOverlayOpen) return;

      const onKeyDown = (event: KeyboardEvent) => {
         if (event.key === "Escape") {
            closeOverlay();
         }
      };

      window.addEventListener("keydown", onKeyDown);
      return () => {
         window.removeEventListener("keydown", onKeyDown);
      };
   }, [isOverlayOpen]);

   return (
      <div
         style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            gap: "1rem",
            background: "#0f1012",
            color: "#f1f3f5",
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
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

         {isOverlayOpen ? (
            <div
               style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(15, 16, 18, 0.85)",
                  backdropFilter: "blur(2px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
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
                     padding: "2rem 3rem",
                     borderRadius: "18px",
                     background: "rgba(22,24,27,0.92)",
                     border: "1px solid rgba(255,255,255,0.08)",
                     boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
                     textAlign: "center",
                  }}
               >
                  <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Overlay</h2>
                  <p style={{ margin: 0, opacity: 0.8 }}>Press Esc or click the X to close.</p>
               </div>
            </div>
         ) : null}
      </div>
   );
}
