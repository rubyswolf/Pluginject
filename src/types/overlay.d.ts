declare global {
   interface Window {
      overlay?: {
         enterFullscreen: () => void;
         exitFullscreen: () => void;
      };
   }
}

export {};
