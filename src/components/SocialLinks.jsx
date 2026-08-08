import "./SocialLinks.css";

function iconProps(size = 15) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
}

export function InstagramIcon({ size = 15 }) {
  return (
    <svg {...iconProps(size)}>
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17.15" cy="6.85" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function XIcon({ size = 15 }) {
  return (
    <svg {...iconProps(size)}>
      <path d="M5 5.5 10.8 12 5.2 18.5h2.6L12 13.6l4.1 4.9h2.7L13.2 12l5.6-6.5h-2.6L12 10.3 8 5.5H5z" />
    </svg>
  );
}

export function FacebookIcon({ size = 15 }) {
  return (
    <svg {...iconProps(size)}>
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" />
      <path d="M13.4 8.2h1.4V6.2h-1.5c-1.7 0-3.1 1.4-3.1 3.1v1.6H8.6v2.1h1.6V18h2.3v-5h1.7l.4-2.1h-2.1V9.4c0-.7.5-1.2 1.2-1.2z" />
    </svg>
  );
}

export function LinkedInIcon({ size = 15 }) {
  return (
    <svg {...iconProps(size)}>
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" />
      <circle cx="8.6" cy="9.1" r="1.05" fill="currentColor" stroke="none" />
      <path d="M7.6 11.4V17M11.4 17v-3.1c0-1.2.9-2.1 2.1-2.1s2.1.9 2.1 2.1V17M11.4 11.4V17" />
    </svg>
  );
}

const SOCIALS = [
  { href: "https://www.instagram.com/", label: "Instagram", Icon: InstagramIcon },
  { href: "https://x.com/", label: "X", Icon: XIcon },
  { href: "https://www.facebook.com/", label: "Facebook", Icon: FacebookIcon },
];

function SocialLinks({ className = "" }) {
  return (
    <div className={`nidus-socials ${className}`.trim()}>
      {SOCIALS.map(({ href, label, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
          <Icon />
        </a>
      ))}
    </div>
  );
}

export default SocialLinks;
