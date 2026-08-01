import { AdminAuthProvider } from "@/context/admin-auth-context";

// This wraps EVERYTHING under /admin/*, including the login page itself —
// login needs access to the auth context too (to call login() and store
// the resulting session). The actual "redirect if not logged in" guard and
// the sidebar live one level deeper, in (protected)/layout.tsx, since the
// login page must NOT have either of those.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
