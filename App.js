import React, {useEffect} from 'react';
import {SafeAreaView, Text, StatusBar, Alert} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import PushNotification from 'react-native-push-notification';

const App = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Message handled in the background!', remoteMessage);
  });

  const getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log(fcmToken);
      axios
        .post('http://192.168.1.9:3000/', {token: fcmToken})
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

  useEffect(() => {
    requestUserPermission();
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      console.log(remoteMessage);
      PushNotification.localNotification({
        title: 'My Notification Title', // (optional)
        message: 'My Notification Message', // (required)
      });
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <StatusBar />
      <SafeAreaView>
        <Text>Demo Notification</Text>
      </SafeAreaView>
    </>
  );
};

export default App;
