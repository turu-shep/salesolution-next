/**
 * The Studio renders its own chrome (sidebar, top bar, etc.) and styling.
 * Strip our site shell from this route so we don't end up with two headers.
 */
export const metadata = {
  title: 'Studio · Sale Solution',
  robots: { index: false, follow: false },
}

// Studio's document-pane header renders the title as a near-invisible
// watermark in dark mode. Force it back to full foreground contrast.
const studioOverrides = `
  [data-testid="pane"] [data-ui="DocumentPanelHeader"] h1,
  [data-testid="pane"] [data-ui="DocumentPanelHeader"] h2,
  [data-testid="document-panel-document-title"],
  [data-testid="pane-header"] h1,
  [data-testid="pane-header"] h2 {
    color: var(--card-fg-color) !important;
    opacity: 1 !important;
  }
`

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: studioOverrides }} />
      {children}
    </>
  )
}
