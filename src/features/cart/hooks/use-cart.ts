"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCartSession } from "@/context/cart-context";
import { queryKeys } from "@/lib/query/query-keys";
import { addCartItem, fetchCart, removeCartItem, updateCartItemQuantity } from "../api/cart.api";

// One hook that reads the cart plus every mutation that can change it —
// every customer-facing component that touches the cart goes through this,
// so the "current session" logic never has to be repeated elsewhere.
export function useCart() {
  const { sessionId } = useCartSession();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: queryKeys.cart.detail(sessionId),
    queryFn: () => fetchCart(sessionId),
    enabled: !!sessionId,
  });

  // Re-fetches the cart for this session; called after any mutation that changes cart contents.
  function invalidate() {
    queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail(sessionId) });
  }

  // Adds a menu item (or bumps its quantity) and refreshes the cart on success.
  const addItem = useMutation({
    mutationFn: ({ menuItemId, quantity }: { menuItemId: string; quantity: number }) =>
      addCartItem(sessionId, menuItemId, quantity),
    onSuccess: () => {
      invalidate();
      toast.success("Added to cart");
    },
    onError: () => toast.error("Could not add item to cart"),
  });

  // Updates one cart line item's quantity; no toast, since this fires on every +/- click.
  const updateQuantity = useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      updateCartItemQuantity(sessionId, cartItemId, quantity),
    onSuccess: invalidate,
    onError: () => toast.error("Could not update quantity"),
  });

  // Removes a line item entirely and refreshes the cart on success.
  const removeItem = useMutation({
    mutationFn: (cartItemId: string) => removeCartItem(sessionId, cartItemId),
    onSuccess: () => {
      invalidate();
      toast.success("Item removed");
    },
    onError: () => toast.error("Could not remove item"),
  });

  return { cartQuery, addItem, updateQuantity, removeItem, sessionId };
}
