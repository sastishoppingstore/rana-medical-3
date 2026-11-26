import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#ffffff 0%,#f1f8f5 100%)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "clip",
      }}
    >
      {/* top gold hairline */}
      <div style={{ height: 3, background: "linear-gradient(90deg,#b08d4f,#0d9463)" }} />
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "72px 24px" }}>
        <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
          {/* eyebrow */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              color: "#b08d4f",
              fontSize: 11,
              fontWeight: 750,
              letterSpacing: ".22em",
              marginBottom: 26,
            }}
          >
            <span style={{ width: 26, height: 2, background: "#b08d4f", display: "inline-block" }} />
            THE CLARITY STANDARD
            <span style={{ width: 26, height: 2, background: "#b08d4f", display: "inline-block" }} />
          </div>

          {/* big 404 */}
          <div
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "clamp(120px,22vw,220px)",
              lineHeight: .9,
              letterSpacing: "-.04em",
              background: "linear-gradient(135deg,#0d9463 20%,#0a5c40 80%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            404
          </div>

          <h1
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "clamp(30px,4.5vw,44px)",
              margin: "14px 0 0",
              color: "#0c271d",
              letterSpacing: "-.02em",
            }}
          >
            Yeh page <em style={{ color: "#b08d4f", fontStyle: "italic" }}>nahi mila.</em>
          </h1>

          <p style={{ margin: "16px auto 0", maxWidth: 420, color: "#5a7268", fontSize: 15, lineHeight: 1.7 }}>
            The link may be broken, or the page may have moved. Our doctors and staff are
            still one call away — we are here 24/7.
          </p>

          {/* actions */}
          <div style={{ marginTop: 34, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#0d9463",
                color: "#fff",
                fontWeight: 650,
                fontSize: 14.5,
                padding: "13px 26px",
                borderRadius: 12,
                boxShadow: "0 10px 24px rgba(13,148,99,.25)",
                textDecoration: "none",
              }}
            >
              Back to home
            </Link>
            <Link
              href="/erp"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "1.5px solid #d2eae1",
                background: "#fff",
                color: "#0c271d",
                fontWeight: 650,
                fontSize: 14.5,
                padding: "13px 26px",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              Open staff ERP
            </Link>
          </div>
        </div>
      </div>

      {/* footer strip */}
      <div
        style={{
          borderTop: "1px solid #d2eae1",
          padding: "16px 24px",
          textAlign: "center",
          fontSize: 12,
          color: "#71867e",
          background: "#fff",
        }}
      >
        Rana Medical Hospital · 24/7 line 0324-6627054 · Powered by <b style={{ color: "#0a5c40" }}>Wafa Smart Tech</b>
      </div>
    </div>
  );
}
