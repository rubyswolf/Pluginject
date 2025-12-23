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
   accent: "#b3ff00",
};

const lineGradient =
   "linear-gradient(90deg, rgba(26,39,57,0), rgba(90,140,210,0.55), rgba(26,39,57,0))";
const lineBackgroundSizeHorizontal = "100vw 2px";
const lineBackgroundSizeVertical = "100vw 100%";

type ToggleOptionProps = {
   label: string;
   description?: string;
   value: boolean;
   onChange: (value: boolean) => void;
};

type DropdownOptionProps = {
   label: string;
   description?: string;
   value: string;
   options: { label: string; value: string }[];
   onChange: (value: string) => void;
};

function ToggleOption({
   label,
   description,
   value,
   onChange,
}: ToggleOptionProps) {
   const trackWidth = 46;
   const trackHeight = 24;
   const thumbSize = 18;
   const trackBorder = 1;
   const trackPadding = (trackHeight - thumbSize) / 2; // centers thumb vertically and sets horizontal inset
   const innerTrackWidth = trackWidth - trackBorder * 2;
   const thumbShift = innerTrackWidth - thumbSize - trackPadding * 2;

   return (
      <div
         style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(12,23,40,0.65)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
         }}
      >
         <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontWeight: 600 }}>{label}</div>
            {description ? (
               <div style={{ color: palette.subtitle, fontSize: "0.85rem" }}>
                  {description}
               </div>
            ) : null}
         </div>
         <button
            onClick={() => onChange(!value)}
            aria-pressed={value}
            aria-label={`${label} toggle`}
            style={{
               flexShrink: 0,
               flexGrow: 0,
               position: "relative",
               width: `${trackWidth}px`,
               minWidth: `${trackWidth}px`,
               height: `${trackHeight}px`,
               borderRadius: `${trackHeight / 2}px`,
               border: `${trackBorder}px solid ${palette.buttonBorder}`,
               background: value
                  ? `linear-gradient(135deg, ${palette.accent}, #d7ff66)`
                  : "rgba(14,24,38,0.9)",
               boxShadow: value
                  ? "0 6px 18px rgba(179,255,0,0.3)"
                  : "0 6px 18px rgba(0,0,0,0.35)",
               cursor: "pointer",
               padding: 0,
               display: "flex",
               alignItems: "center",
               transition: "background 180ms ease, box-shadow 180ms ease",
            }}
         >
            <span
               style={{
                  width: `${thumbSize}px`,
                  height: `${thumbSize}px`,
                  position: "absolute",
                  top: "50%",
                  left: `${trackPadding}px`,
                  transform: value
                     ? `translate(${thumbShift}px, -50%)`
                     : "translate(0, -50%)",
                  borderRadius: "50%",
                  background: value ? "#f4ffd1" : "#243c5a",
                  boxShadow: value
                     ? "0 4px 12px rgba(179,255,0,0.45)"
                     : "0 2px 8px rgba(0,0,0,0.28)",
                  transition:
                     "transform 180ms ease, background-color 180ms ease, box-shadow 180ms ease",
               }}
            />
         </button>
      </div>
   );
}

function DropdownOption({
   label,
   description,
   value,
   options,
   onChange,
}: DropdownOptionProps) {
   return (
      <div
         style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(12,23,40,0.65)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
         }}
      >
         <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontWeight: 600 }}>{label}</div>
            {description ? (
               <div style={{ color: palette.subtitle, fontSize: "0.85rem" }}>
                  {description}
               </div>
            ) : null}
         </div>
         <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
               background: palette.button,
               border: `1px solid ${palette.buttonBorder}`,
               color: palette.text,
               borderRadius: "10px",
               padding: "8px 12px",
               minWidth: "160px",
               fontSize: "0.95rem",
               boxShadow: "0 8px 18px rgba(0,0,0,0.26)",
               cursor: "pointer",
            }}
         >
            {options.map((opt) => (
               <option key={opt.value} value={opt.value}>
                  {opt.label}
               </option>
            ))}
         </select>
      </div>
   );
}

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

   const [autoUpdates, setAutoUpdates] = useState(true);
   const [backgroundAudio, setBackgroundAudio] = useState(false);
   const [themePreset, setThemePreset] = useState("system");
   const [profile, setProfile] = useState("default");

   const sidebarCollapsedWidth = 56;
   const sidebarExpandedWidth = 132;
   const sidebarWidth = isSidebarExpanded
      ? sidebarExpandedWidth
      : sidebarCollapsedWidth;

   return (
      <div
         style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            width: "100vw",
            position: "relative",
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
                  gridTemplateColumns: `${sidebarCollapsedWidth}px 1fr auto`,
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
                  justifyContent: "flex-start",
                  paddingLeft: "12px",
                  height: "100%",
               }}
            >
               <img
                  src={logo}
                  alt="Pluginject logo"
                  style={{ height: "29px", width: "29px" }}
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
                  backgroundImage: lineGradient,
                  backgroundSize: lineBackgroundSizeHorizontal,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "0 0",
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
               position: "relative",
            }}
         >
            <div
               style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${sidebarWidth - 1}px`,
                  width: "2px",
                  backgroundImage: lineGradient,
                  backgroundSize: lineBackgroundSizeVertical,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: `-${sidebarWidth - 1}px 0`,
                  pointerEvents: "none",
                  zIndex: 1,
               }}
            />
            <div
               onMouseEnter={() => setIsSidebarExpanded(true)}
               onMouseLeave={() => setIsSidebarExpanded(false)}
               style={
                  {
                     width: sidebarWidth,
                     transition: "width 180ms ease",
                     background: "#0a1220",
                     borderRight: "none",
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
                        style={{ height: 24, width: 24 }}
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
                  gap: "16px",
                  padding: "22px 28px",
                  color: palette.text,
                  overflow: "auto",
               }}
            >
               <div
                  style={{
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "space-between",
                     gap: "12px",
                  }}
               >
                  <div
                     style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                     }}
                  >
                     <h1
                        style={{
                           margin: 0,
                           fontSize: "1.4rem",
                           letterSpacing: "0.02em",
                        }}
                     >
                        Settings
                     </h1>
                     <p
                        style={{
                           margin: 0,
                           color: palette.subtitle,
                           fontSize: "0.95rem",
                        }}
                     >
                        Demo controls using custom toggle and dropdown
                        components.
                     </p>
                  </div>
                  <button
                     onClick={openOverlay}
                     style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: `1px solid ${palette.buttonBorder}`,
                        background: palette.button,
                        color: palette.text,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        boxShadow: "0 10px 26px rgba(0,0,0,0.26)",
                        transition:
                           "transform 120ms ease, box-shadow 120ms ease, background 120ms ease, border-color 120ms ease",
                     }}
                     onMouseDown={(e) => e.currentTarget.blur()}
                     onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                           "0 14px 32px rgba(0,0,0,0.34)";
                        e.currentTarget.style.background = palette.buttonHover;
                        e.currentTarget.style.borderColor =
                           palette.buttonHoverBorder;
                     }}
                     onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                           "0 10px 26px rgba(0,0,0,0.26)";
                        e.currentTarget.style.background = palette.button;
                        e.currentTarget.style.borderColor =
                           palette.buttonBorder;
                     }}
                  >
                     Open Overlay
                  </button>
               </div>

               <div
                  style={{
                     background: "rgba(9, 15, 26, 0.82)",
                     borderRadius: "16px",
                     border: `1px solid ${palette.border}`,
                     padding: "16px",
                     boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
                     display: "flex",
                     flexDirection: "column",
                     gap: "12px",
                  }}
               >
                  <div
                     style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                     }}
                  >
                     <div style={{ fontWeight: 700, letterSpacing: "0.02em" }}>
                        General
                     </div>
                     <div
                        style={{
                           fontSize: "0.85rem",
                           color: palette.subtitle,
                        }}
                     >
                        Presets & toggles
                     </div>
                  </div>
                  <div
                     style={{
                        display: "grid",
                        gridTemplateColumns:
                           "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "12px",
                     }}
                  >
                     <ToggleOption
                        label="Auto updates"
                        description="Download and apply minor updates automatically."
                        value={autoUpdates}
                        onChange={setAutoUpdates}
                     />
                     <ToggleOption
                        label="Background audio"
                        description="Keep sounds enabled while Pluginject is minimized."
                        value={backgroundAudio}
                        onChange={setBackgroundAudio}
                     />
                     <DropdownOption
                        label="Theme"
                        description="Pick a visual preset for the UI."
                        value={themePreset}
                        options={[
                           { label: "System", value: "system" },
                           { label: "Midnight", value: "midnight" },
                           { label: "Neon", value: "neon" },
                        ]}
                        onChange={setThemePreset}
                     />
                     <DropdownOption
                        label="Profile"
                        description="Load preferences for this workspace."
                        value={profile}
                        options={[
                           { label: "Default", value: "default" },
                           { label: "Streaming", value: "streaming" },
                           { label: "Gaming", value: "gaming" },
                        ]}
                        onChange={setProfile}
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
