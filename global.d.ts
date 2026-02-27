// Minimal fallback to ensure the `JSX` namespace exists for 3rd-party type packages
// (Only used when @types/react isn't picked up by the compiler)
declare namespace JSX {
  interface IntrinsicElements {
    // Allow any intrinsic element to avoid type errors from libraries
    [elemName: string]: any;
  }
}

export {};

// Provide a minimal module declaration for react-markdown so the compiler
// doesn't try to type-check its shipped TypeScript sources.
declare module 'react-markdown' {
  import type { ComponentType } from 'react';
  const ReactMarkdown: ComponentType<any>;
  export default ReactMarkdown;
}
