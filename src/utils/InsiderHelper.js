import RNInsider from 'react-native-insider';
import RNInsiderIdentifier from 'react-native-insider/src/InsiderIdentifier';
import API_CONFIG from '../config/apiConfig';

// User Identification Class
class InsiderUser {
  static login(userData) {
    if (!API_CONFIG.insider.enabled) return;
    try {
      if (!userData || (!userData.id && !userData.email && !userData.phone)) {
        console.warn('[Insider] At least one identifier (id/email/phone) is required for login');
        return;
      }

      const currentUser = RNInsider.getCurrentUser();
      const identifiers = new RNInsiderIdentifier();
      let hasIdentifier = false;

      if (userData.email) {
        identifiers.addEmail(userData.email);
        hasIdentifier = true;
      }

      if (userData.phone) {
        identifiers.addPhoneNumber(String(userData.phone));
        hasIdentifier = true;
      }

      if (userData.id) {
        identifiers.addUserID(String(userData.id));
        hasIdentifier = true;
      }

      if (hasIdentifier) {
        currentUser.login(identifiers);
      }

      if (userData.name) {
        currentUser.setName(userData.name);
      }
      if (userData.email) {
        currentUser.setEmail(userData.email);
      }
      if (userData.phone) {
        currentUser.setPhoneNumber(String(userData.phone));
      }

      console.log('[Insider] User logged in:', userData.id || userData.email);
    } catch (error) {
      console.error('[Insider] Error in user login:', error);
    }
  }

  static logout() {
    if (!API_CONFIG.insider.enabled) return;
    try {
      RNInsider.getCurrentUser().logout();
      console.log('[Insider] User logged out');
    } catch (error) {
      console.error('[Insider] Error in user logout:', error);
    }
  }
}

class InsiderEvents {

  // Central enabled check
  static _isEnabled() {
    return API_CONFIG.insider.enabled;
  }

  // Helper: Create Insider Product
  static createProduct(product) {
    try {
      // ID Logic matching Urun.js: 'P-' + pid or direct id
      const productID = String(
        product.id ||
        product.product_id ||
        product.productID ||
        product.ProductID ||
        product.urun_id ||
        product.pid ||
        ''
      );

      const name = String(
        product.name ||
        product.ad ||
        product.urunad ||
        product.title ||
        product.productName ||
        ''
      );

      let finalTaxonomy = [];
      if (Array.isArray(product.taxonomy) && product.taxonomy.length > 0) {
        finalTaxonomy = product.taxonomy;
      } else if (Array.isArray(product.categories) && product.categories.length > 0) {
        finalTaxonomy = product.categories;
      } else {
        // Taxonomy Construction Logic matching Urun.js
        finalTaxonomy = ["Taze Çiçek"];
        const { breadcatad3, breadcatad2, breadcatad } = product;

        if (breadcatad3 && breadcatad3 !== "") finalTaxonomy.push(breadcatad3);
        if (breadcatad2 && breadcatad2 !== "" && breadcatad2 !== breadcatad3) finalTaxonomy.push(breadcatad2);
        if (breadcatad && breadcatad !== "" && breadcatad !== breadcatad2) finalTaxonomy.push(breadcatad);
      }

      if (finalTaxonomy.length === 0) {
        finalTaxonomy = ['General'];
      }

      let imageURL = String(
        product.product_image_url ||
        product.image_url ||
        product.imageURL ||
        product.image ||
        product.thumbnail ||
        product.resim ||
        product.imgurl ||
        ''
      );

      if (!imageURL || imageURL === '') {
        imageURL = API_CONFIG.defaultLogo;
      }

      // Price Logic matching Urun.js
      // unit_sale_price is the selling price (fiyat)
      const salePrice = parseFloat(
        product.unit_sale_price ||
        product.price ||
        product.fiyat ||
        product.sale_price ||
        product.totalPrice ||
        0
      );

      // unit_price is the original price (fiyatindirimsiz)
      // If unit_price is not provided, we check for other fields.
      // Note: Urun.js logic: unit_price: response.data.fiyatindirimsiz > 0 ? response.data.fiyatindirimsiz : response.data.fiyat || 0
      let listPrice = parseFloat(
        product.unit_price ||
        product.unitPrice ||
        product.fiyatindirimsiz ||
        0
      );

      // If listPrice is 0, it might mean there is no discount, so list price = sale price.
      // However, to match Urun.js exactly, if it's 0 there, it falls back to sale price.
      if (listPrice === 0) {
        listPrice = salePrice;
      }

      const currency = product.currency || 'TRY';

      console.log('[Insider] Creating product - ID:', productID, 'Name:', name, 'Sale Price:', salePrice, 'List Price:', listPrice, 'Taxonomy:', finalTaxonomy, 'Image:', imageURL);

      if (!productID) {
        console.warn('[Insider] Product ID is empty, skipping');
        return null;
      }

      const pprice = listPrice > salePrice ? listPrice : salePrice;

      const insiderProduct = RNInsider.createNewProduct(
        productID,
        name,
        finalTaxonomy,
        imageURL,
        pprice,
        currency
      );

         if (listPrice > salePrice) {
        insiderProduct.setSalePrice(salePrice);  
      }

      const quantity = parseInt(product.quantity || product.adet || product.Quantity || 1);
      if (quantity > 0) {
        insiderProduct.setQuantity(quantity);
      }

      const stock = parseInt(product.stock || product.stok || 0);
      if (stock > 0) {
        insiderProduct.setStock(stock);
      }

      // Handle URL if provided (Urun.js passes url)
      if (product.url) {
        // Try standard setUrl if available
        if (typeof insiderProduct.setUrl === 'function') {
          insiderProduct.setUrl(String(product.url));
        } else {
          // Fallback to custom attribute
          insiderProduct.setCustomAttributeWithString('url', String(product.url));
        }
      }

      // Explicitly set both unit_sale_price and unit_price as custom attributes
      // to ensure exact match with Urun.js structure.

      // Only send unit_list_price if there is a discount (listPrice > salePrice)
      // if (listPrice > salePrice) {
      //   insiderProduct.setCustomAttributeWithDouble('unit_list_price', listPrice);
      // }

   

      console.log('[Insider] Product created:', productID, name);
      return insiderProduct;
    } catch (error) {
      console.error('[Insider] Error creating product:', error);
      return null;
    }
  }

  // Helper: Create Product Array
  static createProductArray(products) {
    if (!Array.isArray(products)) return [];
    return products.map(p => InsiderEvents.createProduct(p)).filter(p => p !== null);
  }

  // Page Visit Events
  static visitHomePage() {
    if (!InsiderEvents._isEnabled()) return;
    try {
      RNInsider.visitHomePage();
      console.log('[Insider Event] visitHomePage triggered');
    } catch (error) {
      console.error('[Insider Event Error] visitHomePage:', error);
    }
  }

  static visitListingPage(taxonomy) {
    if (!InsiderEvents._isEnabled()) return;
    try {
      const taxonomyArray = Array.isArray(taxonomy) ? taxonomy : [taxonomy];
      if (taxonomyArray.length > 0) {
        RNInsider.visitListingPage(taxonomyArray);
        console.log('[Insider Event] visitListingPage triggered:', taxonomyArray);
      }
    } catch (error) {
      console.error('[Insider Event Error] visitListingPage:', error);
    }
  }

  static visitProductDetailPage(product) {
    if (!InsiderEvents._isEnabled()) return;
    try {
      const insiderProduct = InsiderEvents.createProduct(product);
      if (insiderProduct) {
        RNInsider.visitProductDetailPage(insiderProduct);
        console.log('[Insider Event] visitProductDetailPage triggered:', product.id || product.product_id || product.productID);
      }
    } catch (error) {
      console.error('[Insider Event Error] visitProductDetailPage:', error);
    }
  }

  static visitCartPage(products) {
    if (!InsiderEvents._isEnabled()) return;
    try {
      if (!products || !Array.isArray(products) || products.length === 0) {
        console.log('[Insider Event] visitCartPage - empty cart');
        return;
      }
      const insiderProducts = InsiderEvents.createProductArray(products);
      if (insiderProducts.length > 0) {
        RNInsider.visitCartPage(insiderProducts);
        console.log('[Insider Event] visitCartPage triggered with', insiderProducts.length, 'products');
      }
    } catch (error) {
      console.error('[Insider Event Error] visitCartPage:', error);
    }
  }

  // Cart Events
  static itemAddedToCart(product) {
    if (!InsiderEvents._isEnabled()) return;
    try {
      const insiderProduct = InsiderEvents.createProduct(product);
      if (insiderProduct) {
        RNInsider.itemAddedToCart(insiderProduct);
        console.log('[Insider Event] itemAddedToCart triggered:', product.id || product.product_id || product.productID || product.pid);
      }
    } catch (error) {
      console.error('[Insider Event Error] itemAddedToCart:', error);
    }
  }

  static itemRemovedFromCart(productId) {
    if (!InsiderEvents._isEnabled()) return;
    try {
      if (productId) {
        RNInsider.itemRemovedFromCart(String(productId));
        console.log('[Insider Event] itemRemovedFromCart triggered:', productId);
      }
    } catch (error) {
      console.error('[Insider Event Error] itemRemovedFromCart:', error);
    }
  }

  static cartCleared() {
    if (!InsiderEvents._isEnabled()) return;
    try {
      RNInsider.cartCleared();
      console.log('[Insider Event] cartCleared triggered');
    } catch (error) {
      console.error('[Insider Event Error] cartCleared:', error);
    }
  }

  // Wishlist Events
  static itemAddedToWishlist(product) {
    if (!InsiderEvents._isEnabled()) return;
    try {
      const insiderProduct = InsiderEvents.createProduct(product);
      if (insiderProduct) {
        RNInsider.itemAddedToWishlist(insiderProduct);
        console.log('[Insider Event] itemAddedToWishlist triggered:', product.id || product.product_id || product.productID || product.pid);
      }
    } catch (error) {
      console.error('[Insider Event Error] itemAddedToWishlist:', error);
    }
  }

  static itemRemovedFromWishlist(productId) {
    if (!InsiderEvents._isEnabled()) return;
    try {
      if (productId) {
        RNInsider.itemRemovedFromWishlist(String(productId));
        console.log('[Insider Event] itemRemovedFromWishlist triggered:', productId);
      }
    } catch (error) {
      console.error('[Insider Event Error] itemRemovedFromWishlist:', error);
    }
  }

  static wishlistCleared() {
    if (!InsiderEvents._isEnabled()) return;
    try {
      RNInsider.wishlistCleared();
      console.log('[Insider Event] wishlistCleared triggered');
    } catch (error) {
      console.error('[Insider Event Error] wishlistCleared:', error);
    }
  }

  // Purchase Event
  static itemPurchased(saleId, product) {
    if (!InsiderEvents._isEnabled()) return;
    try {
      const insiderProduct = InsiderEvents.createProduct(product);
      if (insiderProduct && saleId) {
        RNInsider.itemPurchased(String(saleId), insiderProduct);
        console.log('[Insider Event] itemPurchased triggered - Sale:', saleId, 'Product:', product.id || product.productID || product.pid);
      }
    } catch (error) {
      console.error('[Insider Event Error] itemPurchased:', error);
    }
  }

  // Sign Up Event
  static signUpConfirmation() {
    if (!InsiderEvents._isEnabled()) return;
    try {
      RNInsider.signUpConfirmation();
      console.log('[Insider Event] signUpConfirmation triggered');
    } catch (error) {
      console.error('[Insider Event Error] signUpConfirmation:', error);
    }
  }

  // Search Event
  static search(query, filters = {}) {
    if (!InsiderEvents._isEnabled()) return;
    try {
      if (!query) return;

      const searchEvent = RNInsider.tagEvent('search');
      searchEvent.addParameterWithString('keyword', String(query));
      searchEvent.build();

      console.log('[Insider Event] search triggered:', query);
    } catch (error) {
      console.error('[Insider Event Error] search:', error);
    }
  }

  // Checkout Event
  static checkoutStarted(products, cartId) {
    if (!InsiderEvents._isEnabled()) return;
    try {
      const checkoutEvent = RNInsider.tagEvent('checkout_started');
      if (cartId) {
        checkoutEvent.addParameterWithString('cart_id', String(cartId));
      }
      if (products && products.length) {
        checkoutEvent.addParameterWithInt('item_count', products.length);
      }
      checkoutEvent.build();

      console.log('[Insider Event] checkoutStarted triggered');
    } catch (error) {
      console.error('[Insider Event Error] checkoutStarted:', error);
    }
  }

  // Custom Event
  static trackCustomEvent(eventName, parameters = {}) {
    if (!InsiderEvents._isEnabled()) return;
    try {
      if (!eventName) return;

      const customEvent = RNInsider.tagEvent(eventName);

      Object.keys(parameters).forEach(key => {
        const value = parameters[key];
        if (typeof value === 'string') {
          customEvent.addParameterWithString(key, value);
        } else if (typeof value === 'number') {
          customEvent.addParameterWithDouble(key, value);
        } else if (typeof value === 'boolean') {
          customEvent.addParameterWithBoolean(key, value);
        }
      });

      customEvent.build();
      console.log('[Insider Event] Custom event triggered:', eventName);
    } catch (error) {
      console.error('[Insider Event Error] trackCustomEvent:', error);
    }
  }

  // GDPR Consent
  static setGDPRConsent(consent) {
    if (!InsiderEvents._isEnabled()) return;
    try {
      RNInsider.setGDPRConsent(!!consent);
      console.log('[Insider] GDPR consent set to:', !!consent);
    } catch (error) {
      console.error('[Insider] Error setting GDPR consent:', error);
    }
  }

  // Push notification permission
  static setPushNotificationPermission(isGranted) {
    if (!InsiderEvents._isEnabled()) return;
    try {
      const event = RNInsider.tagEvent('push_permission_status');
      event.addParameterWithBoolean('granted', !!isGranted);
      event.build();
      console.log('[Insider] Push permission event sent:', !!isGranted);
    } catch (error) {
      console.error('[Insider] Error setting push permission:', error);
    }
  }

  // CCPA Consent
  static setCCPAConsent(consent) {
    if (!InsiderEvents._isEnabled()) return;
    try {
      RNInsider.setGDPRConsent(!!consent);
      console.log('[Insider] CCPA consent set to:', !!consent);
    } catch (error) {
      console.error('[Insider] Error setting CCPA consent:', error);
    }
  }
}

// Legacy exports for backward compatibility
export const createInsiderProduct = InsiderEvents.createProduct;
export const createInsiderProductArray = InsiderEvents.createProductArray;

export { InsiderUser, InsiderEvents };
export default InsiderEvents;
