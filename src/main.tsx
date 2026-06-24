import { Component, StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import ResizeObserverPolyfill from 'resize-observer-polyfill';
import App from './App';
import './styles.css';

// Old iPad WebKit (pre–iOS 13.4) ships no ResizeObserver. React Flow uses it
// to measure the canvas; without it the diagram pane sizes to 0 and renders
// blank while the rest of the app works. plugin-legacy polyfills language
// features but not DOM APIs, so install this one ourselves when it's missing.
if (typeof window !== 'undefined' && !('ResizeObserver' in window)) {
  (window as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverPolyfill;
}

// BigInt is a language primitive (iOS 14+) that core-js/plugin-legacy cannot
// polyfill. React Flow only uses it as a monotonic serial counter for its
// update queue — BigInt(0) and n + BigInt(1) — so on engines without it we
// alias BigInt to Number. The counter still increments correctly; we only
// give up overflow safety past 2^53, which no UI session will ever reach.
if (typeof window !== 'undefined' && !('BigInt' in window)) {
  (window as unknown as { BigInt: unknown }).BigInt = Number;
}

// ── On-screen error reporter ──────────────────────────────────────────────
// The iPad can't easily be inspected, so surface any error directly on the
// page. This is a diagnostic aid; remove once the device issue is resolved.
function showError(label: string, detail: string) {
  const box = document.createElement('pre');
  box.style.cssText =
    'position:fixed;left:0;right:0;bottom:0;max-height:60%;overflow:auto;margin:0;' +
    'z-index:99999;background:#1b0000;color:#ff9b9b;font:12px/1.4 monospace;' +
    'padding:12px;white-space:pre-wrap;border-top:2px solid #ff4d4d;';
  box.textContent = `⚠️ ${label}\n${detail}`;
  document.body.appendChild(box);
}

window.addEventListener('error', (e) => {
  showError('window error', `${e.message}\n${e.filename}:${e.lineno}:${e.colno}`);
});
window.addEventListener('unhandledrejection', (e) => {
  showError('unhandled promise rejection', String((e as PromiseRejectionEvent).reason));
});

class ErrorBoundary extends Component<{ children: ReactNode }, { msg: string | null }> {
  state = { msg: null as string | null };
  static getDerivedStateFromError(err: unknown) {
    return { msg: err instanceof Error ? `${err.message}\n\n${err.stack ?? ''}` : String(err) };
  }
  render() {
    if (this.state.msg) {
      return (
        <pre style={{ margin: 0, padding: 16, color: '#b00', font: '13px/1.5 monospace', whiteSpace: 'pre-wrap' }}>
          ⚠️ React render error{'\n'}
          {this.state.msg}
        </pre>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
