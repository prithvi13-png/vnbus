export default function ServerErrorPage(): React.JSX.Element {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        color: "#111827",
        padding: 24,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <section
        style={{
          maxWidth: 560,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          background: "#ffffff",
          padding: 32,
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>500</p>
        <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700 }}>Server error</h1>
        <p style={{ margin: "12px 0 0", color: "#4b5563", lineHeight: 1.6 }}>
          The platform could not complete the request.
        </p>
      </section>
    </main>
  );
}
