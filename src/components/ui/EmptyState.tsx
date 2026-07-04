import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Link-based action (public facing) */
  action?: {
    label: string;
    href: string;
  };
  /** Button-based action (admin panels) */
  actionLabel?: string;
  onAction?: () => void;
  /** Link-based action using actionLabel (admin panels) */
  href?: string;
  className?: string;
  icon?: "cart" | "heart" | "search" | "box" | "default" | React.ReactNode;
}

const icons: Record<string, React.ReactNode> = {
  cart: (
    <svg className="w-16 h-16 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  heart: (
    <svg className="w-16 h-16 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  search: (
    <svg className="w-16 h-16 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  box: (
    <svg className="w-16 h-16 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  default: (
    <svg className="w-16 h-16 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
};

export function EmptyState({ title, description, action, actionLabel, onAction, href, className, icon = "default" }: EmptyStateProps) {
  const iconElement = typeof icon === "string"
    ? (icons[icon] || icons.default)
    : icon;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className ?? ""}`}>
      <div className="mb-6">{iconElement}</div>
      <h3 className="text-lg font-medium text-zinc-300 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-500 max-w-sm mb-6">{description}</p>
      )}
      {action && !actionLabel && (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center rounded-lg bg-lime-400 text-black px-6 py-3 text-sm font-semibold hover:bg-lime-300 transition-colors"
        >
          {action.label}
        </Link>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center rounded-lg bg-lime-400 text-black px-6 py-3 text-sm font-semibold hover:bg-lime-300 transition-colors"
        >
          {actionLabel}
        </button>
      )}
      {actionLabel && href && !onAction && (
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-lg bg-lime-400 text-black px-6 py-3 text-sm font-semibold hover:bg-lime-300 transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
