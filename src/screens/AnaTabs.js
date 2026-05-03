import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Ekranlarınızı burada import edin
import Anasayfa from './Anasayfa';
import Login from './Login';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused
                ? 'ios-information-circle'
                : 'ios-information-circle-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'ios-list-box' : 'ios-list';
            }

            // İkonları döndürmek için herhangi bir bileşen kullanabilirsiniz
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen name="Anasayfa" component={Anasayfa}  options={{ headerShown: false }}  />
        <Tab.Screen name="Giriş" component={Login} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
