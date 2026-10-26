const PALETTE = [
  "#8B75D7",
  "#D77F75",
  "#5FA88C",
  "#D7A34B",
  "#5F8FD7",
  "#B4629A",
];

function colorFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

const SIZE_CLASSES = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: keyof typeof SIZE_CLASSES;
}) {
  const initial = name.trim().slice(0, 1) || "?";
  const color = colorFor(name || "?");

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${SIZE_CLASSES[size]}`}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
