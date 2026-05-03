
import analytics from '@react-native-firebase/analytics';

class FirebaseEvents {

    // Login Event
    static async logLogin(method) {
        try {
            await analytics().logLogin({
                method: method,
            });
            console.log('[Firebase Event] logLogin triggered:', method);
        } catch (error) {
            console.error('[Firebase Event Error] logLogin:', error);
        }
    }

    // View Item Event (View Content)
    static async logViewItem(params) {
        try {
            const { id, name, price, currency, type } = params;

            await analytics().logViewItem({
                currency: currency || 'TRY',
                value: price ? parseFloat(price) : 0,
                items: [
                    {
                        item_id: String(id),
                        item_name: name || '',
                        price: price ? parseFloat(price) : 0,
                        item_category: type || 'product',
                    },
                ],
            });
            console.log('[Firebase Event] logViewItem triggered:', params);
        } catch (error) {
            console.error('[Firebase Event Error] logViewItem:', error);
        }
    }

    // Add To Cart Event
    static async logAddToCart(params) {
        try {
            const { id, name, price, currency, quantity, type } = params;

            await analytics().logAddToCart({
                currency: currency || 'TRY',
                value: (price ? parseFloat(price) : 0) * (quantity || 1),
                items: [
                    {
                        item_id: String(id),
                        item_name: name || '',
                        price: price ? parseFloat(price) : 0,
                        quantity: quantity || 1,
                        item_category: type || 'product'
                    }
                ]
            });
            console.log('[Firebase Event] logAddToCart triggered:', params);
        } catch (error) {
            console.error('[Firebase Event Error] logAddToCart:', error);
        }
    }

    // Begin Checkout Event
    static async logBeginCheckout(params) {
        try {
            const { totalPrice, currency, itemCount } = params;

            // Note: logBeginCheckout items are optional but recommended. 
            // Since we might not have full item details here easily, we rely on value.
            await analytics().logBeginCheckout({
                currency: currency || 'TRY',
                value: totalPrice ? parseFloat(totalPrice) : 0,
                // items: [] // If we had items we would pass them here
            });
            console.log('[Firebase Event] logBeginCheckout triggered:', params);
        } catch (error) {
            console.error('[Firebase Event Error] logBeginCheckout:', error);
        }
    }
}

export default FirebaseEvents;
