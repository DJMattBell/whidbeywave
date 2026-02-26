// Minimal layout — no Navbar, no Footer, no install prompt
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
