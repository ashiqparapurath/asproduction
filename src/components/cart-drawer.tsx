
'use client';

import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus, Minus, Send, ShoppingCart } from 'lucide-react';

export function CartDrawer() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleSendEnquiry = () => {
    const businessPhoneNumber = '97430147881'; // Replace with your business WhatsApp number
    
    const messageParts = cartItems.map(item => 
      `${item.name} (x${item.quantity}) - ${formatPrice(item.price * item.quantity)}`
    );
    
    const enquiryMessage = `Hello AS PRODUCTION, I'd like to enquire about the following items:\n\n${messageParts.join('\n')}\n\nTotal: ${formatPrice(totalAmount)}`;
    
    const whatsappUrl = `https://wa.me/${businessPhoneNumber}?text=${encodeURIComponent(enquiryMessage)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-full">
      {cartItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">Your cart is empty</h3>
          <p className="mt-2 text-sm text-muted-foreground">Add some products to get started.</p>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 -mx-6">
            <div className="px-6 space-y-4">
            {cartItems.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                   <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
                    {item.showPrice ? (
                      <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                    ) : null}
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t mt-auto -mx-6 px-6 pt-4">
            <div className="flex justify-between font-bold text-lg">
              <p>Total</p>
              <p>{formatPrice(totalAmount)}</p>
            </div>
             <Button onClick={handleSendEnquiry} className="w-full mt-4">
              Send Enquiry via WhatsApp
              <Send className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={clearCart} className="w-full mt-2">Clear Cart</Button>
          </div>
        </>
      )}
    </div>
  );
}
