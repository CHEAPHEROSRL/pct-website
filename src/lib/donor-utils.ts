const AVATAR_COLORS = [
  "#3D7A5A", "#5B8EA6", "#C45C26", "#7B6B8E",
  "#A68B5B", "#6B8E7B", "#8B7355", "#6B7B5B",
  "#8E6B7B", "#5B6B8E",
];

export function avatarColor(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
