import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import ScheduleScreen from './ScheduleScreen';
import RegisterLectureScreen from './RegisterLectureScreen';
import EditLectureScreen from './EditLectureScreen'

const Stack = createStackNavigator();

const ScheduleStackScreen = ({navigation}) => (
    <Stack.Navigator headerMode='none'>
        <Stack.Screen name="ScheduleScreen" component={ScheduleScreen}/>
        <Stack.Screen name="RegisterLectureScreen" component={RegisterLectureScreen}/>
        <Stack.Screen name="EditLectureScreen" component={EditLectureScreen}/>
    </Stack.Navigator>
);

export default ScheduleStackScreen;