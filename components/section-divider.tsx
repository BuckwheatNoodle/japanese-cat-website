export function SectionDivider() {
  return (
    <div
      className="w-full flex justify-center items-center py-4 animate-slide-in-bottom"
      style={{ animationDelay: "0.3s" }}
    >
      <svg width="80%" height="20" viewBox="0 0 300 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 10 L300 10" stroke="#EAD8C0" strokeWidth="2" strokeDasharray="4 4" />
        <g fill="#D4A57A">
          <circle cx="20" cy="10" r="3" />
          <circle cx="50" cy="10" r="3" />
          <circle cx="150" cy="10" r="5" />
          <circle cx="250" cy="10" r="3" />
          <circle cx="280" cy="10" r="3" />
        </g>
      </svg>
    </div>
  )
}
