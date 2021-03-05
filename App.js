/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {SafeAreaView, Text, StatusBar, Button, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

const App = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Message handled in the background!', remoteMessage);
  });

  const getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log(fcmToken);
      axios
        .post('http://192.168.1.22:3000/', {token: fcmToken})
        .then((res) => {
          console.log('res', res.data);
        })
        .catch((err) => {
          console.log('err', err);
        });
    } else {
      console.log('Failed', 'No token received');
    }
  };

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      getFcmToken();
      console.log('Authorization status:', authStatus);
    }
  };

  /// show notification via firebase
  useEffect(() => {
    requestUserPermission();
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);

        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);

        // process the action
      },
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log(remoteMessage);

      if (Platform.OS === 'ios') {
        PushNotificationIOS.presentLocalNotification({
          alertBody: 'Test Notifi',
          alertTitle: 'Test',
        });
        PushNotificationIOS.setApplicationIconBadgeNumber();
      } else {
        PushNotification.localNotification({
          title: 'My Notification Title', // (optional)
          message: 'My Notification Message', // (required)
        });
        // Show notificaiton number
        PushNotification.setApplicationIconBadgeNumber();
      }
    });
    return unsubscribe;
  }, []);

  // hard show notification
  const handleNotification = () => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.presentLocalNotification({
        alertBody: 'Test Notifi',
        alertTitle: 'Test',
      });
    } else {
      PushNotification.localNotification({
        title: 'My Notification Title', // (optional)
        message: 'My Notification Message', // (required)
      });
    }
  };

  return (
    <>
      <StatusBar />
      <SafeAreaView>
        <Button
          title={'Shown notificaion'}
          onPress={() => handleNotification()}
        />
      </SafeAreaView>
    </>
  );
};

export default App;
