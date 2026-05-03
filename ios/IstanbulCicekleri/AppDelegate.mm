#import "AppDelegate.h"
#import <Firebase.h>
#import <InsiderMobile/Insider.h>
#import <RNInsider/RNInsider.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

  // UNUserNotificationCenter delegate'ini ayarla - foreground push için gerekli
  [UNUserNotificationCenter currentNotificationCenter].delegate = self;

  // Insider InApp/Push Callback'lerini Firebase'den önce ayarla
  [Insider registerInsiderCallbackWithSelector:@selector(insiderCallback:)
                                        sender:self];

  [FIRApp configure];
  self.moduleName = @"IstanbulCicekleri";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application
      didFinishLaunchingWithOptions:launchOptions];
}

// Insider Callback İşleyicisi
- (void)insiderCallback:(NSDictionary *)dict {
  int type = [[dict objectForKey:@"type"] intValue];
  NSLog(@"[AppDelegate][INSIDER][CALLBACK] Type: %d, Data: %@", type, dict);

  // Eğer Native tarafta özel bir işlem (örn: temp store custom action)
  // yapılacaksa buraya eklenebilir. RNInsider zaten kendi callback'ini yönetir,
  // ancak döküman gereği Native delegate set ediliyor.
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
  return [self bundleURL];
}

- (NSURL *)bundleURL {

#if DEBUG
  return
      [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else

  NSString *documentsPath = [NSSearchPathForDirectoriesInDomains(
      NSDocumentDirectory, NSUserDomainMask, YES) firstObject];
  NSString *otaBundlePath = [documentsPath
      stringByAppendingPathComponent:@"ota_bundles/main.jsbundle"];

  NSFileManager *fileManager = [NSFileManager defaultManager];
  if ([fileManager fileExistsAtPath:otaBundlePath]) {
    NSLog(@"[OTA] Loading JS bundle from: %@", otaBundlePath);
    return [NSURL fileURLWithPath:otaBundlePath];
  }

  // OTA bundle yoksa varsayılan bundle'ı kullan
  NSLog(@"[OTA] Loading default bundle from main bundle");
  return [[NSBundle mainBundle] URLForResource:@"main"
                                 withExtension:@"jsbundle"];
#endif
}

// Kullanıcının iznini isteme
- (void)application:(UIApplication *)application
    didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [FIRMessaging messaging].APNSToken = deviceToken;
  [Insider registerDeviceTokenWithApplication:application
                                  deviceToken:deviceToken];
}

// Bildirim izni isteği
- (void)application:(UIApplication *)application
    didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  NSLog(@"Failed to register: %@", error);
}

#pragma mark - UNUserNotificationCenterDelegate

// Foreground'da push notification geldiğinde çağrılır
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:
             (void (^)(UNNotificationPresentationOptions))completionHandler {

  NSLog(@"[AppDelegate] Foreground notification received: %@",
        notification.request.content.userInfo);

  // Insider SDK'nın foreground push'u işlemesine izin ver
  // Banner, badge ve sound göster
  if (@available(iOS 14.0, *)) {
    completionHandler(UNNotificationPresentationOptionBanner |
                      UNNotificationPresentationOptionSound |
                      UNNotificationPresentationOptionBadge);
  } else {
    completionHandler(UNNotificationPresentationOptionAlert |
                      UNNotificationPresentationOptionSound |
                      UNNotificationPresentationOptionBadge);
  }
}

// Kullanıcı bildirime tıkladığında çağrılır
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
    didReceiveNotificationResponse:(UNNotificationResponse *)response
             withCompletionHandler:(void (^)(void))completionHandler {

  NSDictionary *userInfo = response.notification.request.content.userInfo;

  NSLog(@"[AppDelegate] Notification tapped: %@", userInfo);

  // Insider push kontrolü
  BOOL isInsiderPush =
      userInfo[@"source"] && [userInfo[@"source"] isEqualToString:@"Insider"];
  if (!isInsiderPush) {
    isInsiderPush = userInfo[@"ins_push_type"] != nil;
  }

  if (isInsiderPush) {
    NSLog(@"[AppDelegate] Insider push notification tapped");

    // Insider SDK'ya push işleme bilgisini gönder (metrik takibi için)
    [Insider triggerPushProcessWithNotificationResponse:response];

    // Deep link URL'ini bul - Insider farklı field'larda gönderebilir
    NSString *deepLinkUrl = nil;

    // Olası field'ları kontrol et - Insider ins_dl_external kullanıyor
    NSArray *possibleFields = @[
      @"ins_dl_external", @"url", @"URL", @"deeplink", @"deep_link", @"link",
      @"andUrl", @"iosUrl"
    ];
    for (NSString *field in possibleFields) {
      if (userInfo[field] && [userInfo[field] isKindOfClass:[NSString class]]) {
        deepLinkUrl = userInfo[field];
        NSLog(@"[AppDelegate] Found URL in field '%@': %@", field, deepLinkUrl);
        break;
      }
    }

    // data içinde de kontrol et (nested)
    if (!deepLinkUrl && userInfo[@"data"] &&
        [userInfo[@"data"] isKindOfClass:[NSDictionary class]]) {
      NSDictionary *data = userInfo[@"data"];
      for (NSString *field in possibleFields) {
        if (data[field] && [data[field] isKindOfClass:[NSString class]]) {
          deepLinkUrl = data[field];
          NSLog(@"[AppDelegate] Found URL in data.%@: %@", field, deepLinkUrl);
          break;
        }
      }
    }

    // URL bulunduysa React Native'e gönder (Safari açmak yerine)
    if (deepLinkUrl && deepLinkUrl.length > 0) {
      NSLog(@"[AppDelegate] Found deep link URL: %@", deepLinkUrl);
      NSURL *url = [NSURL URLWithString:deepLinkUrl];
      if (url) {
        // URL'i ve timestamp'i NSUserDefaults'a kaydet (fallback için)
        // Timestamp, eski URL'lerin yanlışlıkla kullanılmasını önler
        // NOT: URL'i Native tarafta TEMİZLEMİYORUZ - JS tarafı temizleyecek
        // Çünkü cold start'ta JS hazır olmayabilir
        [[NSUserDefaults standardUserDefaults] setObject:deepLinkUrl
                                                  forKey:@"pendingDeepLink"];
        [[NSUserDefaults standardUserDefaults]
            setDouble:[[NSDate date] timeIntervalSince1970]
               forKey:@"pendingDeepLinkTimestamp"];
        [[NSUserDefaults standardUserDefaults] synchronize];

        // Background'dan gelirken JS thread'in hazır olması için kısa bir
        // gecikme
        NSLog(@"[AppDelegate] Sending deep link to React Native with delay");
        dispatch_after(
            dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.3 * NSEC_PER_SEC)),
            dispatch_get_main_queue(), ^{
              NSLog(@"[AppDelegate] Now sending URL: %@", deepLinkUrl);
              [RCTLinkingManager application:[UIApplication sharedApplication]
                                     openURL:url
                                     options:@{}];
              // JS tarafı URL'i işledikten sonra temizleyecek (timestamp
              // kontrolü ile)
            });
      }
    }
  }

  // Firebase (non-Insider) push'lar için deep link kontrolü
  if (!isInsiderPush) {
    NSLog(@"[AppDelegate] Non-Insider (Firebase) push notification tapped");

    // data payload'dan deep link URL çıkar
    NSString *fcmDeepLinkUrl = nil;
    NSArray *fcmLinkFields = @[ @"deeplink", @"url", @"link", @"deep_link" ];

    for (NSString *field in fcmLinkFields) {
      if (userInfo[field] && [userInfo[field] isKindOfClass:[NSString class]]) {
        fcmDeepLinkUrl = userInfo[field];
        NSLog(@"[AppDelegate] Firebase push: Found URL in '%@': %@", field,
              fcmDeepLinkUrl);
        break;
      }
    }

    // Nested "data" dictionary içinde de kontrol et (FCM bazen iç içe gönderir)
    if (!fcmDeepLinkUrl && userInfo[@"data"] &&
        [userInfo[@"data"] isKindOfClass:[NSDictionary class]]) {
      NSDictionary *data = userInfo[@"data"];
      for (NSString *field in fcmLinkFields) {
        if (data[field] && [data[field] isKindOfClass:[NSString class]]) {
          fcmDeepLinkUrl = data[field];
          NSLog(@"[AppDelegate] Firebase push: Found URL in data.%@: %@", field,
                fcmDeepLinkUrl);
          break;
        }
      }
    }

    if (fcmDeepLinkUrl && fcmDeepLinkUrl.length > 0) {
      NSLog(@"[AppDelegate] Firebase push deep link: %@", fcmDeepLinkUrl);
      NSURL *url = [NSURL URLWithString:fcmDeepLinkUrl];
      if (url) {
        // pendingDeepLink mekanizmasını kullan (cold start ile aynı)
        [[NSUserDefaults standardUserDefaults] setObject:fcmDeepLinkUrl
                                                  forKey:@"pendingDeepLink"];
        [[NSUserDefaults standardUserDefaults]
            setDouble:[[NSDate date] timeIntervalSince1970]
               forKey:@"pendingDeepLinkTimestamp"];
        [[NSUserDefaults standardUserDefaults] synchronize];

        dispatch_after(
            dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.3 * NSEC_PER_SEC)),
            dispatch_get_main_queue(), ^{
              NSLog(@"[AppDelegate] Sending Firebase push URL to RN: %@",
                    fcmDeepLinkUrl);
              [RCTLinkingManager application:[UIApplication sharedApplication]
                                     openURL:url
                                     options:@{}];
            });
      }
    }
  }

  completionHandler();
}

- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:
                (NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  if ([[url.scheme lowercaseString] isEqualToString:@"insideristanbulcicekleri"]) {
    [Insider handleUrl:url];
    return YES;
  }

  return [super application:app openURL:url options:options];
}

@end
