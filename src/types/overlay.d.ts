declare global {
   interface Window {
      overlay?: {
         openOverlayWindow: () => Promise<void>;
         closeOverlayWindow: () => Promise<void>;
      };
   }
}

export {};
