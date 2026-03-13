import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          fontFamily: "Georgia, serif",
          background: "#1C1F1A",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            width: "100%",
            height: 6,
            background: "linear-gradient(90deg, #3D7A5A, #C45C26)",
            display: "flex",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            padding: "48px 80px",
            gap: 24,
          }}
        >
          {/* Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 6,
              color: "#FFFFFF88",
            }}
          >
            YESCHAPTER
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "#FFFFFF",
                textAlign: "center",
                lineHeight: 1.1,
                letterSpacing: -1,
              }}
            >
              Walking 2,650 Miles
            </span>
            <span
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "#C45C26",
                textAlign: "center",
                lineHeight: 1.1,
                letterSpacing: -1,
              }}
            >
              for Cancer
            </span>
          </div>

          {/* Subtitle */}
          <span
            style={{
              fontSize: 22,
              color: "#FFFFFFBB",
              textAlign: "center",
              maxWidth: 600,
              lineHeight: 1.5,
            }}
          >
            Pacific Crest Trail — Mexico to Canada
          </span>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 40,
              marginTop: 16,
            }}
          >
            {[
              { val: "2,650", label: "MILES" },
              { val: "6", label: "MONTHS" },
              { val: "3", label: "STATES" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#3D7A5A",
                  }}
                >
                  {s.val}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 3,
                    color: "#FFFFFF55",
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "20px 80px",
            background: "#FFFFFF08",
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: "#C45C26",
              fontWeight: 600,
            }}
          >
            yeschapter.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
