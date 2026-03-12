import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get the visitor's IP from request headers
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "";

    // Use ip-api.com over HTTP (allowed server-side, free tier doesn't support HTTPS)
    const url = ip
      ? `http://ip-api.com/json/${ip}?fields=status,city,regionName,country,lat,lon`
      : `http://ip-api.com/json/?fields=status,city,regionName,country,lat,lon`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();

    if (data.status !== "success") {
      return NextResponse.json({ status: "fail" }, { status: 404 });
    }

    return NextResponse.json({
      status: "success",
      city: data.city,
      regionName: data.regionName,
      country: data.country,
      lat: data.lat,
      lon: data.lon,
    });
  } catch {
    return NextResponse.json({ status: "fail" }, { status: 500 });
  }
}
