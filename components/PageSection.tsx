import { type ReactNode } from 'react';

/**
 * Consistent page section wrapper — max-width + horizontal padding.
 * Use `bg` for full-bleed background color (applies to outer wrapper).
 */
export default function PageSection({
  children,
  bg,
  className = '',
  id,
}: {
  children: ReactNode;
  bg?: string;
  className?: string;
  id?: string;
}) {
  if (bg) {
    return (
      <section className={bg} id={id}>
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 ${className}`}>
          {children}
        </div>
      </section>
    );
  }

  return (
    <section className={`max-w-6xl mx-auto px-4 sm:px-6 ${className}`} id={id}>
      {children}
    </section>
  );
}
