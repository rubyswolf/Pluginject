declare global {
   interface Window {
      overlay?: {
         openOverlayWindow: () => Promise<void>;
         closeOverlayWindow: () => Promise<void>;
      };
      windowControls?: {
         minimize: () => Promise<void>;
         toggleMaximize: () => Promise<boolean>;
         isMaximized: () => Promise<boolean>;
         close: () => Promise<void>;
         onMaximizeChange?: (callback: (isMaximized: boolean) => void) => void | (() => void);
      };
   }
}

export {};
