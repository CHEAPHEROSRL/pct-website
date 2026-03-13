import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "Someone";
  const rate = searchParams.get("rate") || "$0.25/mi";
  const total = searchParams.get("total") || "$662.50";

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
            gap: 20,
          }}
        >
          {/* Badge label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#C45C26",
              padding: "10px 28px",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 4,
              color: "#FFFFFF",
            }}
          >
            I&apos;M PLEDGING FOR CANCER RESEARCH
          </div>

          {/* Rate */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              marginTop: 16,
            }}
          >
            <span
              style={{
                fontSize: 96,
                fontWeight: 700,
                color: "#C45C26",
                letterSpacing: -2,
                lineHeight: 1,
              }}
            >
              {rate}
            </span>
          </div>

          {/* Pledger info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 22,
              color: "#FFFFFFBB",
              marginTop: 4,
            }}
          >
            <span>{name} pledged {rate} per mile</span>
          </div>

          {/* Total if completed */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 32px",
              background: "#FFFFFF0F",
              marginTop: 8,
            }}
          >
            <span
              style={{
                fontSize: 18,
                color: "#FFFFFF88",
                letterSpacing: 2,
              }}
            >
              TOTAL IF PAUL FINISHES 2,650 MILES:
            </span>
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#3D7A5A",
              }}
            >
              {total}
            </span>
          </div>

          {/* Foundation split */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              color: "#FFFFFF66",
              marginTop: 4,
            }}
          >
            <span>50% Tower Cancer Research</span>
            <span style={{ color: "#FFFFFF33" }}>·</span>
            <span>50% Cancer Council NSW</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 80px",
            background: "#FFFFFF08",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 4,
                color: "#FFFFFF88",
              }}
            >
              YESCHAPTER
            </span>
            <span
              style={{
                fontSize: 13,
                color: "#FFFFFF44",
                letterSpacing: 2,
              }}
            >
              WALKING FOR CANCER
            </span>
          </div>
          <span
            style={{
              fontSize: 18,
              color: "#C45C26",
              fontWeight: 600,
            }}
          >
            yeschapter.com/pledge
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
