//
//  NotificationService.m
//  InsiderNotificationService
//
//  Created by murat on 4.12.2025.
//

#import "NotificationService.h"
#import <InsiderMobileAdvancedNotification/InsiderPushNotification.h>

@interface NotificationService ()

@property(nonatomic, strong) void (^contentHandler)
    (UNNotificationContent *contentToDeliver);
@property(nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request
                   withContentHandler:
                       (void (^)(UNNotificationContent *_Nonnull))
                           contentHandler {
  NSLog(@"[RichPush] didReceiveNotificationRequest called");
  NSLog(@"[RichPush] UserInfo: %@", request.content.userInfo);

  self.contentHandler = contentHandler;
  self.bestAttemptContent = [request.content mutableCopy];

  NSDictionary *userInfo = request.content.userInfo;

  // Insider push kontrolü
  BOOL isInsiderPush =
      (userInfo[@"source"] && [userInfo[@"source"] isEqualToString:@"Insider"]) ||
      userInfo[@"ins_push_type"] != nil;

  if (isInsiderPush) {
    // Insider rich push notification handling
    NSLog(@"[RichPush] Insider push detected, using Insider SDK");
    __weak typeof(self) weakSelf = self;
    [InsiderPushNotification
        showInsiderRichPush:self.bestAttemptContent
                   appGroup:@"group.insider.com.istanbulcicekleri.mobileapp.istanbulCicekleri"
             nextButtonText:@"▶"
                goToAppText:@"Uygulamaya Git"
                    success:^(UNNotificationAttachment *attachment) {
                      NSLog(@"[RichPush] Insider success callback received");
                      __strong typeof(weakSelf) strongSelf = weakSelf;
                      if (strongSelf) {
                        if (attachment) {
                          NSLog(@"[RichPush] Insider attachment found: %@",
                                attachment);
                          strongSelf.bestAttemptContent.attachments =
                              @[ attachment ];
                        } else {
                          NSLog(@"[RichPush] Insider no attachment returned");
                        }
                        strongSelf.contentHandler(strongSelf.bestAttemptContent);
                      }
                    }];
  } else {
    // Firebase (non-Insider) rich push notification handling
    NSLog(@"[RichPush] Firebase push detected, checking for image");

    NSString *imageUrl = nil;

    // FCM otomatik olarak fcm_options.image gönderir
    if (userInfo[@"fcm_options"] &&
        [userInfo[@"fcm_options"] isKindOfClass:[NSDictionary class]]) {
      imageUrl = userInfo[@"fcm_options"][@"image"];
    }

    // data payload'da image alanı kontrolü
    if (!imageUrl) {
      imageUrl = userInfo[@"image"] ?: userInfo[@"image_url"] ?: userInfo[@"imageUrl"];
    }

    if (imageUrl && imageUrl.length > 0) {
      NSLog(@"[RichPush] Firebase image URL: %@", imageUrl);
      [self downloadImageAndAttach:imageUrl];
    } else {
      NSLog(@"[RichPush] No image URL found, delivering as-is");
      self.contentHandler(self.bestAttemptContent);
    }
  }
}

- (void)downloadImageAndAttach:(NSString *)imageUrlString {
  NSURL *imageUrl = [NSURL URLWithString:imageUrlString];
  if (!imageUrl) {
    NSLog(@"[RichPush] Invalid image URL: %@", imageUrlString);
    self.contentHandler(self.bestAttemptContent);
    return;
  }

  NSURLSession *session = [NSURLSession sharedSession];
  NSURLSessionDownloadTask *task = [session
      downloadTaskWithURL:imageUrl
        completionHandler:^(NSURL *_Nullable tempLocation,
                            NSURLResponse *_Nullable response,
                            NSError *_Nullable error) {
          if (error) {
            NSLog(@"[RichPush] Image download error: %@", error);
            self.contentHandler(self.bestAttemptContent);
            return;
          }

          if (!tempLocation) {
            NSLog(@"[RichPush] No temp location for downloaded image");
            self.contentHandler(self.bestAttemptContent);
            return;
          }

          // Dosya uzantısını belirle
          NSString *ext = @"jpg";
          NSString *mimeType = response.MIMEType;
          if ([mimeType containsString:@"png"]) {
            ext = @"png";
          } else if ([mimeType containsString:@"gif"]) {
            ext = @"gif";
          } else if ([mimeType containsString:@"webp"]) {
            ext = @"webp";
          }

          // Geçici dosyayı uzantılı hale getir (UNNotificationAttachment bunu ister)
          NSString *tempDir = NSTemporaryDirectory();
          NSString *fileName =
              [NSString stringWithFormat:@"push_image_%@.%@",
                                         [[NSUUID UUID] UUIDString], ext];
          NSString *filePath = [tempDir stringByAppendingPathComponent:fileName];
          NSURL *fileUrl = [NSURL fileURLWithPath:filePath];

          NSError *moveError;
          [[NSFileManager defaultManager] moveItemAtURL:tempLocation
                                                  toURL:fileUrl
                                                  error:&moveError];
          if (moveError) {
            NSLog(@"[RichPush] File move error: %@", moveError);
            self.contentHandler(self.bestAttemptContent);
            return;
          }

          NSError *attachError;
          UNNotificationAttachment *attachment =
              [UNNotificationAttachment attachmentWithIdentifier:@"push_image"
                                                             URL:fileUrl
                                                         options:nil
                                                           error:&attachError];
          if (attachError) {
            NSLog(@"[RichPush] Attachment creation error: %@", attachError);
          } else if (attachment) {
            NSLog(@"[RichPush] Image attachment created successfully");
            self.bestAttemptContent.attachments = @[ attachment ];
          }

          self.contentHandler(self.bestAttemptContent);
        }];

  [task resume];
}

- (void)serviceExtensionTimeWillExpire {
  // Called just before the extension will be terminated by the system.
  NSLog(@"[RichPush] serviceExtensionTimeWillExpire called");
  self.contentHandler(self.bestAttemptContent);
}

@end
