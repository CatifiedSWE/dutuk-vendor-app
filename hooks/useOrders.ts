import { useState } from 'react';

export interface Order {
  id: string;
  title: string;
  customerName: string;
  packageType: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const updateOrderStatus = async (orderId: string, status: 'approved' | 'rejected'): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update order status in local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Failed to update order status:', error);
      setLoading(false);
      return false;
    }
  };

  const getOrders = async (): Promise<Order[]> => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock orders data
      const mockOrders: Order[] = [
        {
          id: '1',
          title: 'Wedding Photography',
          customerName: 'John & Sarah',
          packageType: 'Premium Package',
          customerEmail: 'john.sarah@example.com',
          customerPhone: '+1 (555) 123-4567',
          status: 'pending',
          date: 'October 26, 2025'
        },
        {
          id: '2',
          title: 'Corporate Event',
          customerName: 'Tech Corp Inc.',
          packageType: 'Business Package',
          customerEmail: 'events@techcorp.com',
          customerPhone: '+1 (555) 987-6543',
          status: 'approved',
          date: 'October 24, 2025'
        }
      ];
      
      setOrders(mockOrders);
      setLoading(false);
      return mockOrders;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setLoading(false);
      return [];
    }
  };

  return {
    orders,
    loading,
    updateOrderStatus,
    getOrders
  };
};