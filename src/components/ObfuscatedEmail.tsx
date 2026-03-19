"use client";

/**
 * Renders an email link assembled via JavaScript so it doesn't appear
 * as a plain string in static HTML — makes it harder for scrapers.
 */
export default function ObfuscatedEmail({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  const parts = ["info", "yeschapter", "com"];
  const email = `${parts[0]}@${parts[1]}.${parts[2]}`;
  return (
    <a href={`mailto:${email}`} className={className}>
      {label ?? email}
    </a>
  );
}
