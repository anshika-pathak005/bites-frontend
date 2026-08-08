// A single line item in a cart (a menu item plus the quantity ordered).
export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
}

// A customer's cart, scoped to an anonymous HttpOnly guestId cookie (no client sessionId).
export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
}
