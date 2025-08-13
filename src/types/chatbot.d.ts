interface RayaChatbotOptions {
  apiUrl?: string;
  apiKey?: string;
  messagesApiUrl?: string;
  container?: HTMLElement;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  title?: string;
  subtitle?: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  primaryColor?: string;
  enableMorphing?: boolean;
}

interface RayaChatbotInstance {
  open(): void;
  close(): void;
  destroy(): void;
  updateConfig(newConfig: Partial<RayaChatbotOptions>): void;
}

declare class RayaChatbot {
  constructor(options?: RayaChatbotOptions);
  open(): void;
  close(): void;
  destroy(): void;
  updateConfig(newConfig: Partial<RayaChatbotOptions>): void;
}

declare global {
  interface Window {
    RayaChatbot: typeof RayaChatbot;
    chatbotInstance?: RayaChatbotInstance;
  }
}

export {};
