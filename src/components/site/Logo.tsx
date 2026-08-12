export function Logo({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 5L13.6 10.4L19 12L13.6 13.6L12 19L10.4 13.6L5 12L10.4 10.4L12 5Z"
        fill="currentColor"
      />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.45"
        strokeLinecap="round"
      />
      <circle cx="19" cy="7" r="2" fill="currentColor" />
    </svg>
  );
}
