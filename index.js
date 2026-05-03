/**
 * @format
 * cd android && ./gradlew clean && cd ..
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { Settings } from 'react-native-fbsdk-next';

AppRegistry.registerComponent(appName, () => App);
Settings.initializeSDK();
