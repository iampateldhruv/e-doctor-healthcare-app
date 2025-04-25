import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Trash, ShoppingBag, CreditCard } from 'lucide-react';

interface CartItem {
  id: number;
  medicineId: number;
  name: string;
  price: string;
  image: string | null;
  quantity: number;
}

const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get all medicines to display in cart
  const { data: medicines, isLoading } = useQuery({
    queryKey: ['/api/medicines'],
  });

  // Parse URL parameters when directed from "Add to Cart"
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const medicineId = urlParams.get('medicineId');
    const quantity = urlParams.get('qty') || '1';
    
    if (medicineId) {
      // Find the medicine in the medicines data
      const medicine = medicines?.find(m => m.id.toString() === medicineId);
      
      if (medicine) {
        addToCart(medicine, parseInt(quantity, 10));
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, '/cart');
        
        toast({
          title: 'Added to Cart',
          description: `${medicine.name} has been added to your cart.`,
        });
      }
    } else {
      // Load cart from localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error('Failed to parse cart data', e);
        }
      }
    }
  }, [medicines, toast]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (medicine: any, quantity: number) => {
    setCart(prevCart => {
      // Check if the item is already in the cart
      const existingItemIndex = prevCart.findIndex(item => item.medicineId === medicine.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Add new item
        return [...prevCart, {
          id: Date.now(), // Use timestamp as a unique ID
          medicineId: medicine.id,
          name: medicine.name,
          price: medicine.price,
          image: medicine.image,
          quantity: quantity
        }];
      }
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    toast({
      title: 'Item Removed',
      description: 'The item has been removed from your cart.',
    });
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const priceAsNumber = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return total + (priceAsNumber * item.quantity);
    }, 0).toFixed(2);
  };

  const handleCheckout = () => {
    // In a real app, this would redirect to a checkout page or payment gateway
    toast({
      title: 'Order Placed',
      description: 'Your order has been successfully placed!',
    });
    
    // Clear cart
    setCart([]);
    
    // Redirect to a confirmation page
    setLocation('/order-confirmation');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <ShoppingBag className="mr-2 h-6 w-6" />
        <h1 className="text-3xl font-bold">Your Cart</h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : cart.length === 0 ? (
        <Card className="w-full">
          <CardContent className="py-10">
            <div className="text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Add some items to your cart to see them here.
              </p>
              <Button onClick={() => setLocation('/pharmacy')}>
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart ({cart.length} items)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Product</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="h-16 w-16 rounded-md overflow-hidden bg-muted">
                            <img
                              src={item.image || "https://via.placeholder.com/150"}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-r-none"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                              className="h-8 w-12 rounded-none text-center"
                              min="1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-l-none"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.price}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button variant="outline" onClick={() => setLocation('/pharmacy')}>
                  Continue Shopping
                </Button>
                <Button variant="ghost" onClick={() => setCart([])}>
                  Clear Cart
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(parseFloat(calculateTotal()) * 0.07).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-4">
                    <span>Total</span>
                    <span>${(parseFloat(calculateTotal()) * 1.07).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;