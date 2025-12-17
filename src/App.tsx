import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import closeSfx from "../audio/close.wav";
import openSfx from "../audio/open.wav";
import logo from "./icon.svg";

const palette = {
   bg: "#080f1a",
   header: "#0c1728",
   border: "#1a2739",
   button: "#19283d",
   buttonBorder: "#233652",
   buttonHover: "#203554",
   buttonHoverBorder: "#2d4768",
   text: "#f4f7fb",
   subtitle: "#c4cfde",
   overlayScrim: "rgba(7, 13, 22, 0.78)",
   overlayCard: "rgba(14, 24, 38, 0.9)",
   overlayCardBorder: "rgba(255,255,255,0.08)",
   overlayCloseBg: "rgba(20, 34, 54, 0.6)",
};

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
      // Wait briefly so the close sound can start before the window is hidden.
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

      window.windowControls
         .isMaximized?.()
         .then((max) => setIsMaximized(!!max));
      const unsubscribe = window.windowControls.onMaximizeChange?.((max) =>
         setIsMaximized(!!max)
      );

      return () => {
         if (typeof unsubscribe === "function") unsubscribe();
      };
   }, []);

   useEffect(() => {
      if (!window.devtools) return;

      const onKeyDown = (event: KeyboardEvent) => {
         if (event.key === "F12") {
            event.preventDefault();
            window.devtools?.toggle?.();
         }
      };

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
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
               background: palette.overlayScrim,
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
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: palette.overlayCloseBg,
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
                  background: palette.overlayCard,
                  border: `1px solid ${palette.overlayCardBorder}`,
                  boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
                  textAlign: "center",
                  maxWidth: "520px",
                  width: "90%",
               }}
            >
               <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Overlay</h2>
               <p style={{ margin: 0, color: "#c7d2e5" }}>
                  Press Esc or click the X to close.
               </p>
            </div>
         </div>
      );
   }

   const controlButtonStyle: CSSProperties = {
      width: "42px",
      height: "100%",
      borderRadius: 0,
      border: "none",
      background: "transparent",
      color: "#eaf0f9",
      cursor: "pointer",
      fontSize: "12px",
      lineHeight: 1,
      padding: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background 120ms ease, color 120ms ease",
   };

   return (
      <div
         style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            width: "100vw",
            boxSizing: "border-box",
            background: palette.bg,
            color: palette.text,
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
                  padding: "0 0 0 8px",
                  background: palette.header,
                  backgroundImage:
                     "radial-gradient(70% 200% at 50% 100%, rgba(45, 69, 102, 0.16), rgba(90,140,210,0) 65%)",
                  WebkitAppRegion: "drag",
                  userSelect: "none",
               } as CSSProperties
            }
         >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
               <img
                  src={logo}
                  alt="Pluginject logo"
                  style={{ height: "26px", width: "26px" }}
               />
               <div
                  style={{
                     fontWeight: 700,
                     letterSpacing: "0.08em",
                     fontSize: "0.9rem",
                     textTransform: "uppercase",
                  }}
               >
                  Pluginject
               </div>
            </div>
            <div
               style={
                  {
                     display: "flex",
                     gap: 0,
                     height: "100%",
                     WebkitAppRegion: "no-drag",
                  } as CSSProperties
               }
            >
               <button
                  onClick={handleMinimize}
                  style={{
                     ...controlButtonStyle,
                  }}
                  onMouseEnter={(e) =>
                     (e.currentTarget.style.background = "#15233a")
                  }
                  onMouseLeave={(e) =>
                     (e.currentTarget.style.background = "transparent")
                  }
               >
                  &#x2013;
               </button>
               <button
                  onClick={handleMaximize}
                  style={{
                     ...controlButtonStyle,
                  }}
                  onMouseEnter={(e) =>
                     (e.currentTarget.style.background = "#15233a")
                  }
                  onMouseLeave={(e) =>
                     (e.currentTarget.style.background = "transparent")
                  }
               >
                  {isMaximized ? "▭" : "▢"}
               </button>
               <button
                  onClick={handleClose}
                  style={{ ...controlButtonStyle, color: "#ffffff" }}
                  onMouseEnter={(e) => {
                     e.currentTarget.style.background = "#c23b3b";
                     e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                     e.currentTarget.style.background = "transparent";
                     e.currentTarget.style.color = "#ffffff";
                  }}
               >
                  &#x2715;
               </button>
            </div>
         </div>
         <div
            style={{
               height: "2px",
               background: `linear-gradient(90deg, rgba(18, 35, 59, 1), rgba(38, 63, 99, 1), rgba(49, 69, 97, 1), rgba(38, 63, 99, 1), rgba(18, 35, 59, 1)`,
               WebkitAppRegion: "no-drag",
            }}
         />

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
            <p style={{ margin: 0, color: palette.subtitle }}>Overlay demo</p>
            <button
               onClick={openOverlay}
               style={{
                  padding: "0.9rem 1.4rem",
                  borderRadius: "12px",
                  border: `1px solid ${palette.buttonBorder}`,
                  background: palette.button,
                  color: palette.text,
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
                  transition:
                     "transform 120ms ease, box-shadow 120ms ease, background 120ms ease, border-color 120ms ease",
               }}
               onMouseDown={(e) => e.currentTarget.blur()}
               onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                     "0 14px 36px rgba(0,0,0,0.38)";
                  e.currentTarget.style.background = palette.buttonHover;
                  e.currentTarget.style.borderColor = palette.buttonHoverBorder;
               }}
               onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                     "0 10px 30px rgba(0,0,0,0.28)";
                  e.currentTarget.style.background = palette.button;
                  e.currentTarget.style.borderColor = palette.buttonBorder;
               }}
            >
               Open Overlay
            </button>
         </div>
      </div>
   );
}
