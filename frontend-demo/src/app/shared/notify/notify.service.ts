import { Injectable } from '@angular/core';
import { AppearanceAnimation, DialogLayoutDisplay, DisappearanceAnimation, ToastNotificationInitializer, ToastPositionEnum, ToastProgressBarEnum, ToastUserViewTypeEnum } from '@costlydeveloper/ngx-awesome-popup';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

  constructor() { }


  successMessage(title: string, message: string) {
    const newToastNotification = new ToastNotificationInitializer();

    newToastNotification.setTitle(title);
    newToastNotification.setMessage(message);

    // Choose layout color type
    newToastNotification.setConfig({
      AutoCloseDelay: 5000, // optional
      TextPosition: 'right', // optional
      LayoutType: DialogLayoutDisplay.SUCCESS, // SUCCESS | INFO | NONE | DANGER | WARNING
      ProgressBar: ToastProgressBarEnum.INCREASE, // INCREASE | DECREASE | NONE
      ToastUserViewType: ToastUserViewTypeEnum.SIMPLE, // STANDARD | SIMPLE
      AnimationIn: AppearanceAnimation.BOUNCE_IN, // BOUNCE_IN | SWING | ZOOM_IN | ZOOM_IN_ROTATE | ELASTIC | JELLO | FADE_IN | SLIDE_IN_UP | SLIDE_IN_DOWN | SLIDE_IN_LEFT | SLIDE_IN_RIGHT | NONE
      AnimationOut: DisappearanceAnimation.BOUNCE_OUT, // BOUNCE_OUT | ZOOM_OUT | ZOOM_OUT_WIND | ZOOM_OUT_ROTATE | FLIP_OUT | SLIDE_OUT_UP | SLIDE_OUT_DOWN | SLIDE_OUT_LEFT | SLIDE_OUT_RIGHT | NONE
      // TOP_LEFT | TOP_CENTER | TOP_RIGHT | TOP_FULL_WIDTH | BOTTOM_LEFT | BOTTOM_CENTER | BOTTOM_RIGHT | BOTTOM_FULL_WIDTH
      ToastPosition: ToastPositionEnum.TOP_RIGHT,
    });

    // Simply open the popup
    newToastNotification.openToastNotification$();
  }

  warningMessage(title: string, message: string) {
    const newToastNotification = new ToastNotificationInitializer();

    newToastNotification.setTitle(title);
    newToastNotification.setMessage(message);

    // Choose layout color type
    newToastNotification.setConfig({
      AutoCloseDelay: 5000, // optional
      TextPosition: 'right', // optional
      LayoutType: DialogLayoutDisplay.WARNING, // SUCCESS | INFO | NONE | DANGER | WARNING
      ProgressBar: ToastProgressBarEnum.INCREASE, // INCREASE | DECREASE | NONE
      ToastUserViewType: ToastUserViewTypeEnum.SIMPLE, // STANDARD | SIMPLE
      AnimationIn: AppearanceAnimation.BOUNCE_IN, // BOUNCE_IN | SWING | ZOOM_IN | ZOOM_IN_ROTATE | ELASTIC | JELLO | FADE_IN | SLIDE_IN_UP | SLIDE_IN_DOWN | SLIDE_IN_LEFT | SLIDE_IN_RIGHT | NONE
      AnimationOut: DisappearanceAnimation.BOUNCE_OUT, // BOUNCE_OUT | ZOOM_OUT | ZOOM_OUT_WIND | ZOOM_OUT_ROTATE | FLIP_OUT | SLIDE_OUT_UP | SLIDE_OUT_DOWN | SLIDE_OUT_LEFT | SLIDE_OUT_RIGHT | NONE
      // TOP_LEFT | TOP_CENTER | TOP_RIGHT | TOP_FULL_WIDTH | BOTTOM_LEFT | BOTTOM_CENTER | BOTTOM_RIGHT | BOTTOM_FULL_WIDTH
      ToastPosition: ToastPositionEnum.TOP_RIGHT,
    });

    // Simply open the popup
    newToastNotification.openToastNotification$();
  }
  infoMessage(title: string, message: string) {
    const newToastNotification = new ToastNotificationInitializer();

    newToastNotification.setTitle(title);
    newToastNotification.setMessage(message);

    // Choose layout color type
    newToastNotification.setConfig({
      AutoCloseDelay: 5000, // optional
      TextPosition: 'right', // optional
      LayoutType: DialogLayoutDisplay.INFO, // SUCCESS | INFO | NONE | DANGER | WARNING
      ProgressBar: ToastProgressBarEnum.INCREASE, // INCREASE | DECREASE | NONE
      ToastUserViewType: ToastUserViewTypeEnum.SIMPLE, // STANDARD | SIMPLE
      AnimationIn: AppearanceAnimation.BOUNCE_IN, // BOUNCE_IN | SWING | ZOOM_IN | ZOOM_IN_ROTATE | ELASTIC | JELLO | FADE_IN | SLIDE_IN_UP | SLIDE_IN_DOWN | SLIDE_IN_LEFT | SLIDE_IN_RIGHT | NONE
      AnimationOut: DisappearanceAnimation.BOUNCE_OUT, // BOUNCE_OUT | ZOOM_OUT | ZOOM_OUT_WIND | ZOOM_OUT_ROTATE | FLIP_OUT | SLIDE_OUT_UP | SLIDE_OUT_DOWN | SLIDE_OUT_LEFT | SLIDE_OUT_RIGHT | NONE
      // TOP_LEFT | TOP_CENTER | TOP_RIGHT | TOP_FULL_WIDTH | BOTTOM_LEFT | BOTTOM_CENTER | BOTTOM_RIGHT | BOTTOM_FULL_WIDTH
      ToastPosition: ToastPositionEnum.TOP_RIGHT,
    });

    // Simply open the popup
    newToastNotification.openToastNotification$();
  }
  errorMessage(title: string, message: string) {
    const newToastNotification = new ToastNotificationInitializer();

    newToastNotification.setTitle(title);
    newToastNotification.setMessage(message);

    // Choose layout color type
    newToastNotification.setConfig({
      AutoCloseDelay: 5000, // optional
      TextPosition: 'right', // optional
      LayoutType: DialogLayoutDisplay.DANGER, // SUCCESS | INFO | NONE | DANGER | WARNING
      ProgressBar: ToastProgressBarEnum.INCREASE, // INCREASE | DECREASE | NONE
      ToastUserViewType: ToastUserViewTypeEnum.SIMPLE, // STANDARD | SIMPLE
      AnimationIn: AppearanceAnimation.BOUNCE_IN, // BOUNCE_IN | SWING | ZOOM_IN | ZOOM_IN_ROTATE | ELASTIC | JELLO | FADE_IN | SLIDE_IN_UP | SLIDE_IN_DOWN | SLIDE_IN_LEFT | SLIDE_IN_RIGHT | NONE
      AnimationOut: DisappearanceAnimation.BOUNCE_OUT, // BOUNCE_OUT | ZOOM_OUT | ZOOM_OUT_WIND | ZOOM_OUT_ROTATE | FLIP_OUT | SLIDE_OUT_UP | SLIDE_OUT_DOWN | SLIDE_OUT_LEFT | SLIDE_OUT_RIGHT | NONE
      // TOP_LEFT | TOP_CENTER | TOP_RIGHT | TOP_FULL_WIDTH | BOTTOM_LEFT | BOTTOM_CENTER | BOTTOM_RIGHT | BOTTOM_FULL_WIDTH
      ToastPosition: ToastPositionEnum.TOP_RIGHT,
    });

    // Simply open the popup
    newToastNotification.openToastNotification$();
  }



}
