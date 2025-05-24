import { useEffect } from 'react';
import { supabase, type RestaurantReview } from '@/lib/supabase-client'; // Import supabase client and type

export function useLiveReviews(id: string, push: (r: RestaurantReview) => void) {
  useEffect(() => {
    // Ensure id is valid before subscribing
    if (!id) return;

    const channel = supabase.channel('reviews:' + id);

    channel.on(
        'postgres_changes',
        { 
          schema: 'public', 
          table: 'restaurant_reviews',
          event: 'INSERT', 
          filter: `restaurant_id=eq.${id}` 
        },
        (payload) => {
          console.log('New review received:', payload.new);
          push(payload.new as RestaurantReview);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to reviews channel for restaurant ${id}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`CHANNEL_ERROR for reviews channel restaurant ${id}:`, err ? JSON.stringify(err, null, 2) : 'undefined error object');
        } else if (status === 'TIMED_OUT') {
          console.warn(`Subscription timed out for reviews channel for restaurant ${id}`);
        } else if (status === 'CLOSED') {
          console.warn(`Reviews channel closed for restaurant ${id}. Supabase client will attempt to reconnect.`);
        }
        // Log other statuses if needed
        // console.log(`Channel status for restaurant ${id}: ${status}`, err || '');
      });

    // Cleanup function to remove the channel subscription
    return () => {
      console.log(`Unsubscribing from reviews channel for restaurant ${id}`);
      supabase.removeChannel(channel);
    };
  }, [id, push]); // Add push to dependency array as it's used inside useEffect
}
