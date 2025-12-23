import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import closeSfx from "../audio/close.wav";
import openSfx from "../audio/open.wav";
import logo from "./icon.svg";
import plugdexIcon from "./assets/icons/plugdex.svg";
import settingsIcon from "./assets/icons/settings.svg";

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
   const [isMaximized, setIsMaximized] = useState(false);
   const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

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

   const playSound = useCallback((src: string) => {
      const audio = new Audio(src);
      audio.currentTime = 0;
      audio.play().catch(() => {
         // Ignore autoplay errors (user gesture requirement, etc.)
      });
   }, []);

   const openOverlay = useCallback(() => {
      playSound(openSfx);
      window.overlay?.openOverlayWindow();
   }, [playSound]);

   const closeOverlay = useCallback(() => {
      playSound(closeSfx);
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

   const navItems = [
      { label: "Plugdex", icon: plugdexIcon },
      { label: "Settings", icon: settingsIcon },
   ];

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
                  display: "grid",
                  gridTemplateColumns: "50px 1fr auto",
                  alignItems: "center",
                  padding: 0,
                  background: palette.header,
                  backgroundImage:
                     "radial-gradient(70% 220% at 50% 100%, rgba(90,140,210,0.16), rgba(90,140,210,0) 65%)",
                  position: "relative",
                  WebkitAppRegion: "drag",
                  userSelect: "none",
               } as CSSProperties
            }
         >
            <div
               style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
               }}
            >
               <img
                  src={logo}
                  alt="Pluginject logo"
                  style={{ height: "26px", width: "26px" }}
               />
            </div>
            <div
               style={{
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
               }}
            >
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
            <div
               style={{
                  position: "absolute",
                  inset: "auto 0 0 0",
                  height: "2px",
                  background: `linear-gradient(90deg, rgba(26,39,57,0), rgba(90,140,210,0.55), rgba(26,39,57,0))`,
                  pointerEvents: "none",
               }}
            />
         </div>
         <div
            style={{
               flex: 1,
               display: "flex",
               flexDirection: "row",
               width: "100%",
            }}
         >
            <div
               onMouseEnter={() => setIsSidebarExpanded(true)}
               onMouseLeave={() => setIsSidebarExpanded(false)}
               style={
                  {
                     width: isSidebarExpanded ? 200 : 55,
                     transition: "width 180ms ease",
                     background: "#0a1220",
                     borderRight: "1px solid rgba(255,255,255,0.04)",
                     display: "flex",
                     flexDirection: "column",
                     paddingTop: 0,
                     gap: 0,
                     boxSizing: "border-box",
                     WebkitAppRegion: "no-drag",
                  } as CSSProperties
               }
            >
               {navItems.map((item) => (
                  <button
                     key={item.label}
                     style={{
                        display: "flex",
                        alignItems: "center",
                        gap: isSidebarExpanded ? "12px" : 0,
                        width: "100%",
                        padding: "10px 14px",
                        background: "transparent",
                        border: "none",
                        color: palette.text,
                        textAlign: "left",
                         cursor: "pointer",
                        transition: "background 140ms ease, color 140ms ease",
                        fontSize: "0.95rem",
                     }}
                     onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                           "rgba(90,140,210,0.1)")
                     }
                     onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                     }
                  >
                     <img
                        src={item.icon}
                        alt={item.label}
                        style={{ height: 22, width: 22 }}
                     />
                     <span
                        style={{
                           opacity: isSidebarExpanded ? 1 : 0,
                           maxWidth: isSidebarExpanded ? "200px" : 0,
                           overflow: "hidden",
                           transition:
                              "opacity 140ms ease, max-width 140ms ease",
                           whiteSpace: "nowrap",
                        }}
                     >
                        {item.label}
                     </span>
                  </button>
               ))}
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
               <p style={{ margin: 0, color: palette.subtitle }}>
                  Overlay demo
               </p>
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
                     e.currentTarget.style.borderColor =
                        palette.buttonHoverBorder;
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
      </div>
   );
}
