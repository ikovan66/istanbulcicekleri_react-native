//
//  NotificationViewController.m
//  InsiderNotificationContent
//
//  Created by murat on 4.12.2025.
//

#import "NotificationViewController.h"
#import <InsiderMobileAdvancedNotification/InsiderPushNotification.h>
#import <UserNotifications/UserNotifications.h>
#import <UserNotificationsUI/UserNotificationsUI.h>

@interface NotificationViewController () <UNNotificationContentExtension>

@property(nonatomic, assign) NSInteger currentIndex;

@end

@implementation NotificationViewController

- (void)viewDidLoad {
  [super viewDidLoad];
  self.currentIndex = 0;
}

- (void)didReceiveNotification:(UNNotification *)notification {
  NSLog(@"[InsiderCarousel] didReceiveNotification called");

  // Insider carousel/slider loading
  [InsiderPushNotification
      interactivePushLoad:@"group.insider.com.istanbulcicekleri.mobileapp.istanbulCicekleri"
                superView:self.view
             notification:notification];

  [InsiderPushNotification interactivePushDidReceiveNotification];
}

- (void)
    didReceiveNotificationResponse:(UNNotificationResponse *)response
                 completionHandler:
                     (void (^)(UNNotificationContentExtensionResponseOption))
                         completion {
  NSLog(@"[InsiderCarousel] didReceiveNotificationResponse called");

  // Log placeholder click
  [InsiderPushNotification logPlaceholderClick:response];

  // Handle carousel navigation
  self.currentIndex = [InsiderPushNotification
      didReceiveNotificationResponse:self.currentIndex];

  completion(UNNotificationContentExtensionResponseOptionDoNotDismiss);
}

@end
