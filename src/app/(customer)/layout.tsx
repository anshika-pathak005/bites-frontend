import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/context/cart-context";
import { CustomerAuthProvider } from "@/context/customer-auth-context";

// Everything under app/(customer)/* shares this shell. Admin routes live
// outside this group and get their own layout (sidebar, no navbar/footer,
// no guest cart session) — see app/admin/layout.tsx.
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        <Navbar />
        <main className="pt-20 min-h-screen">{children}</main>
        <Footer />
      </CartProvider>
    </CustomerAuthProvider>
  );
}
