import React, { useState, useEffect } from 'react';
import { AppRegistry } from 'react-native';

import { StyleSheet, Text, View, Button,TouchableOpacity, ActivityIndicator } from 'react-native';
import {Header} from 'react-native-elements';
import { ApolloClient, ApolloProvider, InMemoryCache, useQuery , createHttpLink} from "@apollo/client";

import { GET_CONTINENTS, GET_CONTINENT, SEE_REGIST_LECTURE, GET_U, GET_USERID } from "../queries";
import { Appbar } from 'react-native-paper';
import { NavigationContainer, StackActions, DrawerActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons, EvilIcons } from '@expo/vector-icons';

import { AuthContext, UserContext,IdContext } from '../components/context';
import AsyncStorage from '@react-native-community/async-storage';
 
import AccountScreen from './AccountScreen';
import HomeScreen from './HomeScreen';
import ScheduleStackScreen from './ScheduleStackScreen';
import {Community,Post,Upload,UploadHeader}from "./MainContent"

import { WebView } from 'react-native-webview';

import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';

const Tab = createBottomTabNavigator();

 
const MainContent = ({navigation}) => {//전체게시판 뜨도록(4개)
  const Bid = [
  {id: 1, name:"학교 공지사항"},
  {id :2, name:"학생회 공지사항"},
  {id: 3, name:"익명 게시판"},
  {id:4, name:"중고 나눔거래"}
  ]
  return (
    <View>
      {Bid.map((board)=>(
     <TouchableOpacity  style={styles.line}
        onPress={()=>{navigation.navigate("Community",{id: board.id, name:board.name})}} key={board.id}>
          <Text style={{fontSize:30}}>{board.name}</Text>
        </TouchableOpacity>
      ))
      }
  </View>
  )
}
const TwoLineText = () =>{
    return(
      <View style={{paddingTop:10}}>
        <Text style={{color:"white", fontSize:10 }}>서울과학기술대학교 미래융합대학</Text>
        <Text style={{color:"white", fontSize:21, fontWeight:"700"}}>학교생활 도우미</Text>
      </View>
    )
  }

  const Stack =createStackNavigator();
 



const URI_LMS = "https://future.seoultech.ac.kr/login/index.php";
const URI_HOME  = "https://m-disciplinary.seoultech.ac.kr/";
const URI_PORTAL = "http://portal.seoultech.ac.kr/";


const WebviewLMS = ()=>{
  return <WebView source={{uri:URI_LMS}}/>
}
const WebviewHome = ()=>{
  return <WebView source={{uri:URI_HOME}}/>
}
const WebviewPortal = ()=>{
  return <WebView source={{uri:URI_PORTAL}}/>
}

export default function MainScreen(){
  const userInfo = React.useContext(UserContext);
  const{loading, error, data} = useQuery(GET_USERID,{
    variables: {email: userInfo.email},
    fetchPolicy:"no-cache" 
  })  

  if(loading) return (
    <View style={{flex:1, justifyContent:"center", alignItems:"center"}}>
      <ActivityIndicator size="large" color="#1478FF"/>
    </View>
  );
  if(error) return(<Text>에러!!{error}</Text>);
  const temp ={id: data.findUserbyName[0].id, grade: data.findUserbyName[0].grade} 
    //console.log("temp",temp);
      return ( 
        <IdContext.Provider value = {temp} >
        <Stack.Navigator>
          <Stack.Screen name="default" component={DefaultScreen} options={{headerShown: false}}/>
          <Stack.Screen name="Community" component={Community} />
          <Stack.Screen name="Post" component={Post} /> 
          <Stack.Screen name="Upload" component={Upload} options={
            {headerRight: () => (<Button title="upload"/>
      ) }} />
          <Stack.Screen name="Account" component={AccountScreen}/>
          <Stack.Screen name="WebviewLMS" component={WebviewLMS}/>
          <Stack.Screen name="WebviewHome" component={WebviewHome}/>
          <Stack.Screen name="WebviewPortal" component={WebviewPortal}/>
         </Stack.Navigator>
         </IdContext.Provider>
    );
  }



export function DefaultScreen({navigation}) {
    return (
        <>
          <Header
            placement="left"
            centerComponent={TwoLineText}
            rightComponent={
              <View style={{flexDirection:"row"}}>
                <TouchableOpacity 
                  style={{marginTop:10}}
                ><EvilIcons name="search" size={32} color="white"/>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{marginTop:10}}
                  onPress= {()=>{navigation.navigate("Account")}}
                ><EvilIcons name="user" size={32} color="white"/>
                </TouchableOpacity>
              </View>

            }
            containerStyle={{
              backgroundColor: '#0A6EFF'
            }}
          />
          <AdMobBanner
            style={styles.adcard}
            adUnitID="ca-app-pub-3940256099942544/2934735716" // Test ID, Replace with your-admob-unit-id
            servePersonalizedAds // true or false
            onDidFailToReceiveAdWithError={this.bannerError} />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
  
                if (route.name === '홈') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === '시간표') {
                  iconName = focused ? 'time' : 'time-outline';
                } else if (route.name === '공지') {
                  iconName = focused ? 'notifications' : 'notifications-outline';
                } else if (route.name === '커뮤니티') {
                  iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                }
  
                // You can return any component that you like here!
                return <Ionicons name={iconName} size={size} color={color} />;
              },
            })}
            tabBarOptions={{
              activeTintColor: '#148CFF',
              inactiveTintColor: '#dcdcdc',
              labelPosition: 'below-icon'
            }}
            
          >
            <Tab.Screen name="홈" component={HomeScreen} />
            <Tab.Screen name="시간표" component={ScheduleStackScreen} />
            <Tab.Screen name="공지" component={MainContent} />
            <Tab.Screen name="커뮤니티" component={MainContent} />
          </Tab.Navigator>
        </>
    );
}






const styles = StyleSheet.create({
    card2: {
      padding: 10,
      marginVertical: 5,
      marginHorizontal: 25,
      borderWidth: 1,
      borderColor: "#dcdcdc",
      borderRadius: 10,
      textAlign: "center",
      justifyContent: "center",
    },
    card: {
      padding: 20,
      margin: 25,
      borderWidth: 1,
      borderColor: "#dcdcdc",
      borderRadius: 10,
      textAlign: "center",
      justifyContent: "center",
    },
    date: {
      margin: 5,
      color: "blue",
      fontSize: 15,
      borderColor: "black",
      textAlign: "center",
      justifyContent: "center",
    },
    time: {
      margin: 5,
      fontWeight: "600",
      fontSize: 20,
      textAlign: "center",
    },
    subject: {
      textAlign: "center",
      fontSize: 30,
      fontWeight: "600",
    },
    location: {
      textAlign: "center",
      fontSize: 10,
      color: "#646464",
    },
    week: {
      margin: 5,
      textAlign: "center",
      fontSize: 10,
      color: "#646464",
    },
    where: {
      marginTop: 7,
      padding: 3,
      borderRadius: 10,
      backgroundColor: "#dcdcdc",
      alignSelf: "center",
      fontSize: 10,
      color: "grey",
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      alignItems: "center",
      backgroundColor: "#DDDDDD",
      padding: 10
    }, 
    line: {
      backgroundColor: "#ffffff",
      borderBottomColor: 'black',
      borderBottomWidth: 1,
    },
    adcard:{
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
  });