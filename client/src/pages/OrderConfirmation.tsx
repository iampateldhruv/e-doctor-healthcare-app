import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const OrderConfirmation = () => {
  const [, setLocation] = useLocation();
  
  // In a real app, you would get the order details from an API or state
  const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const date = new Date().toLocaleDateString();
  
  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Card className="w-full">
        <CardHeader className="text-center border-b pb-6">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl">Order Confirmed!</CardTitle>
        </CardHeader>
        
        <CardContent className="py-6">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                Thank you for your order. We've received your purchase and will process it as soon as possible.
              </p>
            </div>
            
            <div className="border rounded-md p-4 bg-muted/30">
              <dl className="divide-y">
                <div className="grid grid-cols-3 py-3">
                  <dt className="text-sm font-medium">Order Number</dt>
                  <dd className="text-sm col-span-2">{orderNumber}</dd>
                </div>
                
                <div className="grid grid-cols-3 py-3">
                  <dt className="text-sm font-medium">Date</dt>
                  <dd className="text-sm col-span-2">{date}</dd>
                </div>
                
                <div className="grid grid-cols-3 py-3">
                  <dt className="text-sm font-medium">Status</dt>
                  <dd className="text-sm col-span-2">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Processing
                    </span>
                  </dd>
                </div>
                
                <div className="grid grid-cols-3 py-3">
                  <dt className="text-sm font-medium">Estimated Delivery</dt>
                  <dd className="text-sm col-span-2">
                    {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} - 
                    {new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div className="rounded-md border p-4 bg-amber-50/50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Important Information</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      For prescription medications, please have your doctor send the prescription to our pharmacy 
                      or upload it through your account. Your order will be on hold until we receive and verify your prescription.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center border-t pt-6">
          <Button onClick={() => setLocation('/dashboard')}>
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => setLocation('/pharmacy')}>
            Continue Shopping
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderConfirmation;