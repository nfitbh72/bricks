/**
 * Global type declarations for Electron API
 */

interface Window {
  electron?: {
    quit: () => void;
  };
}
