
import { AppEventsLogger } from 'react-native-fbsdk-next';

class FacebookEvents {

    // Login Event
    static logLogin(method) {
        try {
            AppEventsLogger.logEvent('fb_mobile_login_method', { method: method });
            console.log('[Facebook Event] logLogin triggered:', method);
        } catch (error) {
            console.error('[Facebook Event Error] logLogin:', error);
        }
    }

    // View Content Event
    static logViewContent(params) {
        try {
            const { id, type, currency, price } = params;

            const parameters = {
                fb_content_type: type || 'product',
                fb_content_id: String(id),
                fb_currency: currency || 'TRY'
            };

            const valueToLog = price ? parseFloat(price) : 0;

            AppEventsLogger.logEvent('fb_mobile_content_view', valueToLog, parameters);
            console.log('[Facebook Event] logViewContent triggered:', parameters);
        } catch (error) {
            console.error('[Facebook Event Error] logViewContent:', error);
        }
    }

    // Add To Cart Event
    static logAddToCart(params) {
        try {
            const { id, type, currency, price, quantity } = params;

            const parameters = {
                fb_content_type: type || 'product',
                fb_content_id: String(id),
                fb_currency: currency || 'TRY',
                fb_num_items: quantity || 1
            };

            const valueToLog = price ? parseFloat(price) * (quantity || 1) : 0;

            AppEventsLogger.logEvent('fb_mobile_add_to_cart', valueToLog, parameters);
            console.log('[Facebook Event] logAddToCart triggered:', parameters);
        } catch (error) {
            console.error('[Facebook Event Error] logAddToCart:', error);
        }
    }

    // Initiate Checkout Event
    static logInitiateCheckout(params) {
        try {
            const { totalPrice, itemCount, currency } = params;

            const parameters = {
                fb_num_items: itemCount || 0,
                fb_currency: currency || 'TRY'
            };

            const valueToLog = totalPrice ? parseFloat(totalPrice) : 0;

            AppEventsLogger.logEvent('fb_mobile_initiated_checkout', valueToLog, parameters);
            console.log('[Facebook Event] logInitiateCheckout triggered:', parameters);
        } catch (error) {
            console.error('[Facebook Event Error] logInitiateCheckout:', error);
        }
    }

    // Purchase Event
    static logPurchase(params) {
        try {
            const { totalPrice, currency, orderId, numItems } = params;

            const parameters = {
                fb_order_id: String(orderId),
                fb_currency: currency || 'TRY',
                fb_num_items: numItems || 1,
            };

            const valueToLog = totalPrice ? parseFloat(totalPrice) : 0;

            AppEventsLogger.logPurchase(valueToLog, currency || 'TRY', parameters);
            console.log('[Facebook Event] logPurchase triggered:', parameters, 'Value:', valueToLog);
        } catch (error) {
            console.error('[Facebook Event Error] logPurchase:', error);
        }
    }

    // Search Event
    static logSearch(searchTerm) {
        try {
            if (!searchTerm) return;

            const parameters = {
                fb_search_string: String(searchTerm),
                fb_success: 1 // 1 for success, 0 for failure (optional)
            };

            AppEventsLogger.logEvent('fb_mobile_search', null, parameters);
            console.log('[Facebook Event] logSearch triggered:', searchTerm);
        } catch (error) {
            console.error('[Facebook Event Error] logSearch:', error);
        }
    }
}

export default FacebookEvents;
