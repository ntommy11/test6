import React from 'react';
import { UserContext } from '../components/context';
import { StyleSheet, Text, View, Button, TouchableOpacity, ActivityIndicator,ScrollView, Modal } from 'react-native';
import { ApolloClient, InMemoryCache, useQuery, ApolloProvider } from "@apollo/client";
import { SEE_REGIST_LECTURE } from '../queries';
import { createStackNavigator } from '@react-navigation/stack';
import { SearchBar } from 'react-native-elements';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';


const colors = [
  "#AFFFEE", "#00F5FF", "#FFE4E1", "#FFFF96" , "#FFDAB9", "#FAC6C6", "#82F9B7"
]
let colorIndex = 0;
let colorMap = {};
colorMap['default'] = "transparent";

const NOW = new Date();
const TIMEZONE = NOW.getTimezoneOffset()*60000;
const NUM_OF_WEEKS = 16;

Date.prototype.getWeek = function (dowOffset) {
  /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

  dowOffset = typeof(dowOffset) == 'number' ? dowOffset : 0; //default dowOffset to zero
  var newYear = new Date(this.getFullYear(),0,1);
  var day = newYear.getDay() - dowOffset; //the day of week the year begins on
  day = (day >= 0 ? day : day + 7);
  var daynum = Math.floor((this.getTime() - newYear.getTime() -
    (this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
  var weeknum;
  //if the year starts before the middle of a week
  if(day < 4) {
    weeknum = Math.floor((daynum+day-1)/7) + 1;
    if(weeknum > 52) {
      let nYear = new Date(this.getFullYear() + 1,0,1);
      let nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      /*if the next year starts before the middle of
        the week, it is week #1 of that year*/
      weeknum = nday < 4 ? 1 : 53;
    }
  }
  else {
    weeknum = Math.floor((daynum+day-1)/7);
  }
  return weeknum;
};

function get_currenet_week(){
  const START_WEEK = -6;
  return NOW.getWeek()-START_WEEK;
}

// 학기 날짜 데이터 초기화
let dates = [];
const start = new Date(2020, 8, 1);
const end = new Date(2020, 11, 16);
for (let d = start; d < end; d.setDate(d.getDate() + 1)) {
  dates.push(new Date(d));
}

function is_empty(obj) {
  return Object.keys(obj).length === 0;
}

const weekday = ['월', '화', '수', '목', '금', '토','일','VOD'];

// weekly_lectures[0]: 일요일
// weekly_lectures[1]: 월요일 ~ 
// weekly_lectures[6]: 토요일 
// weekly_lectures[7]: VOD


const Weekday = ({ classes, day }) => {
  console.log("day in Weekday: ", day);
  console.log("classes in Weekday: ", classes);
  if (classes.length == 0){
    return(
      <View style={{ flexDirection: "row" }}>
        <View style={{
          flex: 1, 
          padding:3, 
          justifyContent:"center",/*borderStyle:"dashed", borderWidth:1*/
          borderBottomWidth: 0,
          borderColor: "#dcdcdc"
          }}>
          <Text style={{textAlign: "center",fontWeight: "600"}}>{weekday[day]}</Text>
        </View>
        <View style={{
          flex: 8, 
          padding: 5,/*borderStyle:"dashed", borderWidth:1*/
          borderBottomWidth: 1,
          borderColor: "#dcdcdc",
          marginRight: 10,
          }}>
          <View>
            <Text style={{color:"#323232",fontWeight:"600"}}> - </Text>
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: "row" }}>
      <View style={{
        flex: 1, 
        padding:3 ,
        justifyContent:"center",/*borderStyle:"dashed", borderWidth:1*/
        borderBottomWidth: 0,
        borderColor: "#dcdcdc"
        }}>
        <Text style={{textAlign: "center", fontWeight: "600"}}>{weekday[day]}</Text>
      </View>
      <View style={{
        flex:8, 
        padding:5, /*borderStyle:"dashed", borderWidth:1*/
        borderBottomWidth: 1,
        borderColor: "#dcdcdc",
        marginRight: 10,
        }}>
        {
          classes.map((class_obj, index)=>{
            return(
              <View key={index} style={{flexDirection:"row"}}>
                <View style={{
                  flex: 5, /*borderStyle:"dashed", borderWidth:1*/
                  
                  }}>
                  <Text style={{color:"#323232",fontWeight:"600"}}>{class_obj.name} / {class_obj.room}</Text>
                </View>
                <View style={{flex: 3, /*borderStyle:"dashed", borderWidth:1,*/ justifyContent:"center"}}>
                  <Text style={{fontSize:10,color:"#8c8c8c"}}>{class_obj.type} {class_obj.start_time}~{class_obj.end_time}</Text>
                </View>
              </View>
            )
          })
        }
      </View>
    </View>
  )
}

function Weekly({ class_list }) {
  const weekdays = [0,1, 2, 3, 4, 5,6,7]; // [월,화,수,목,금,토,일,VOD]
  const current_week = get_currenet_week();

  let weekly_classes = new Array(8);
  for (let i=0; i<weekly_classes.length; i++){
    weekly_classes[i] = new Array();
  }

  for (let i=0; i<class_list.length; i++){  
    if (class_list[i].week == current_week){
      let day = class_list[i].start_time.getDay()-1;
      if (day == -1) day = 6; //일요일에 대한 처리
      let sH = class_list[i].start_time.getHours();
      let sM = class_list[i].start_time.getMinutes();
      let eH = class_list[i].end_time.getHours();
      let eM = class_list[i].end_time.getMinutes();
      let type = class_list[i].vod? "VOD":"SC";
      if (type == "VOD") day = 7;
      let class_obj = {
        name: class_list[i].name,
        room: class_list[i].room,
        day: day,
        start_time: `${sH>=10?sH:`0${sH}`}:${sM>=10?sM:`0${sM}`}`,
        end_time: `${eH>=10?eH:`0${eH}`}:${eM>=10?eM:`0${eM}`}`,
        type: type
      }
      weekly_classes[day].push(class_obj);
    }
  }

  console.log("weekly_classes:" ,weekly_classes);
  return (
    <ScrollView style={styles.card}>
      {
        weekdays.map((day, index) => {
          return <Weekday key={index} classes={weekly_classes[day]} day={day}/>
        })
      }
    </ScrollView>
  )
}


function WeekdayClassbox({class_name}){
  console.log("class_name in WeekdayClassbox:", class_name);
  if (class_name){
    return(
      <View style={styles.classbox(class_name)}>
        <Text style={styles.classboxText}>{class_name}</Text>
      </View>
    )
  }
  else{
    return(
      <View style={styles.classbox("default")}>
      </View>
    )
  }
}

function WeekendClassbox({class_names}){
  console.log("class_names in WeekdayClassbox:", class_names);
  const len = class_names.length;
  let names = ['-','-','-'];
  for(let i=0; i<len; i++){
    names[i] = class_names[i];
  }

  return(
    <View style={styles.classbox2}>
      <View style={{flex:1, backgroundColor: colorMap[names[0]],/*borderStyle:"dashed", borderWidth:1 ,*/justifyContent:"center", paddingVertical:2}}>
        <Text style={styles.classboxTextsmall}>{names[0]}</Text>
      </View>
      <View style={{flex:1, backgroundColor: colorMap[names[1]],/*borderStyle:"dashed", borderWidth:1 ,*/justifyContent:"center", paddingVertical:2}}>
        <Text style={styles.classboxTextsmall}>{names[1]}</Text>
      </View>
      <View style={{flex:1, backgroundColor: colorMap[names[2]],/*borderStyle:"dashed", borderWidth:1 ,*/justifyContent:"center", paddingVertical:2}}>
        <Text style={styles.classboxTextsmall}>{names[2]}</Text>
      </View>
    </View>
  )
}
function MonthlyBody({classes}){
  const weekdays = [0, 1, 2, 3, 4];
  const weekends = [5, 6];
  let weeks = new Array(NUM_OF_WEEKS);
  for(let i=0; i<weeks.length; i++) weeks[i] = i+1;

  return(
    <View>
      {
        weeks.map((week,index)=>{
          return(
            <View key={index} style={{flexDirection:"row", flex:1}}>
              <View style={{flex:1, backgroundColor:"#EBFBFF", justifyContent:"center",borderTopWidth: 1,borderColor:"#dcdcdc"}}> 
                <Text style={{textAlign:"center", fontSize:10, fontWeight:"900"}}>{week}주차</Text>
              </View>
              <View style={{flexDirection:"row", flex:5}}>
                {
                  weekdays.map((day,index)=>{
                    console.log(`classes[${week}][${day}]=${classes[week][day]}`);
                    return <WeekdayClassbox key={index} class_name={classes[week][day]}/>
                  })
                }
              </View>
              <View style={{flexDirection:"row", flex:2}}>
                {
                  weekends.map((day,index)=>{
                    console.log(`classes[${week}][${day}]=${classes[week][day]}`);
                    return <WeekendClassbox key={index} class_names={classes[week][day]}/>
                  })
                }
              </View>
            </View>
          )
        })
      }
    </View>
  )
}

function MonthlyHeader() {
  return (
    <View style={styles.weeklyHeader}>
      <View style={styles.weeklyHeaderBox}>
        <Text style={styles.weeklyHeaderText}>구분</Text>
      </View>
      <View style={styles.weeklyHeaderBox}>
        <Text style={styles.weeklyHeaderText}>월</Text>
      </View>
      <View style={styles.weeklyHeaderBox}>
        <Text style={styles.weeklyHeaderText}>화</Text>
      </View>
      <View style={styles.weeklyHeaderBox}>
        <Text style={styles.weeklyHeaderText}>수</Text>
      </View >
      <View style={styles.weeklyHeaderBox}>
        <Text style={styles.weeklyHeaderText}>목</Text>
      </View>
      <View style={styles.weeklyHeaderBox}>
        <Text style={styles.weeklyHeaderText}>금</Text>
      </View>
      <View style={styles.weeklyHeaderBox}>
        <Text style={styles.weeklyHeaderText}>토</Text>
      </View>
      <View style={styles.weeklyHeaderBox}>
        <Text style={styles.weeklyHeaderText}>일</Text>
      </View>
    </View>
  )
}

function Monthly({class_list}){
  console.log("class_list in Monthly: ", class_list);

  let classes = new Array(NUM_OF_WEEKS+1);
  for (let i=0; i<classes.length; i++){
    classes[i] = [false, false, false, false, false, [],[]]; // 주말은 배열로 관리 
  }

  for (let i=0; i<class_list.length; i++){  
    let week = class_list[i].week;
    let day = class_list[i].start_time.getDay()-1;
    if (day == -1) day = 6; //일요일에 대한 처리
    let type = class_list[i].vod? "VOD":"SC";
    if (type == "VOD") continue;

    if (day<5) classes[week][day]=class_list[i].name;
    else classes[week][day].push(class_list[i].name);
  }

  console.log("classes in Montly: ", classes);

  return(
    <ScrollView 
      stickyHeaderIndices={[0]} 
      style={styles.card}
    >
      <MonthlyHeader />
      <MonthlyBody classes={classes}/>
    </ScrollView>
  )
}



function Main({navigation}) {
  console.log("Main(ScheduleScreen) rendering");
  const [showAD, setShowAD] = React.useState(true);

  const user = React.useContext(UserContext);
  // 시간표 데이터 Fetch & 전처리
  const { loading, error, data, refetch } = useQuery(SEE_REGIST_LECTURE);

  console.log("loading: ",loading);
  console.log("data   : " , data);
  console.log("error  : ", error );

  if(loading){
    console.log("loading...");
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1478FF"/>
      </View>
    )    
  }
  if(data){
    // 데이터 전처리. 
    let lectures = data.seeRegistLecture;
    console.log("length: ", lectures.length);
    let class_list = [];
    colorIndex=0;
    for(let i=0; i<lectures.length; i++){
      // 색깔값 지정 
      colorMap[lectures[i].name] = colors[colorIndex++];
      let num_of_classes = lectures[i].classes.length;
      for(let j=0; j<num_of_classes; j++){
        let start_time = new Date(Number(lectures[i].classes[j].startTime)+TIMEZONE);
        let end_time = new Date(Number(lectures[i].classes[j].endTime)+TIMEZONE);
        let class_obj = {
          name: lectures[i].name,
          room: lectures[i].room,
          start_time: start_time,
          end_time: end_time,
          week: lectures[i].classes[j].week,
          vod: lectures[i].classes[j].VOD
        }
        class_list.push(class_obj);
      }
    }
    // 수업을 빠른 시간순으로 정렬 
    class_list.sort((a,b)=>{
      return a.start_time.getTime() - b.start_time.getTime();
    })
    console.log(class_list);
    const week = get_currenet_week();
    const month = NOW.getMonth()+1;
    return (
      <View style={{flex:1, justifyContent: "center"}}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showAD}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View style={{justifyContent:"center", flex:1}}>
            <AdMobBanner
              style={styles.adcard}
              bannerSize="mediumRectangle"
              adUnitID="ca-app-pub-3940256099942544/2934735716" // Test ID, Replace with your-admob-unit-id
              servePersonalizedAds // true or false
              onDidFailToReceiveAdWithError={this.bannerError} />
            
            <TouchableOpacity style={styles.adButton} onPress={()=>{
              setShowAD(false);
            }}><Text style={{fontSize:20, color:"white"}}>닫기</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <View style={{flex:5}}>
          <Text style={{ textAlign: "left", paddingLeft: 30, fontWeight: "700", paddingTop: 10 }}>금주 수업 {week}주차</Text>
          <Weekly class_list={class_list} />
        </View>
        <View style={{flex:5}}>
          <Text style={{ textAlign: "left", paddingLeft: 30, fontWeight: "700", paddingTop: 10 }}>월별 시간표 {month}월</Text>
          <Monthly class_list={class_list}/>
        </View>
        <View style={{flex:2, flexDirection: "row", alignItems: "center", justifyContent:"center"}}>
          <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('RegisterLectureScreen')}>
            <Text style={{fontSize:20, color:"white"}}>시간표 추가</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('EditLectureScreen')}>
            <Text style={{fontSize:20, color:"white"}}>시간표 편집</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  useFocusEffect(React.useCallback(()=>{
    // 이곳에서 refetch
    alert('SCREEN IS FOCUSED');
    return()=>{
      alert("SCREEN WAS UNFOCUSED");
    }
  },[])
  );
}

function LectureScreen({navigation}){
  console.log("LectureScreen rendering");
  const [text, setText] = React.useState(null);
  
  return(
    <View style={{ flex: 1}}>
      <SearchBar 
        placeholder="강의 찾기"
      />
      <Button title="back" onPress={()=>navigation.navigate("Main")} />
    </View>
  )
}

export default function ScheduleScreen({navigation}) {
  console.log("ScheduleScreen");
  //const [refresh, setRefresh] = React.useState(true);
  const isFocused = useIsFocused();
  const [showAD, setShowAD] = React.useState(true);
  const userInfo = React.useContext(UserContext);
  const client = new ApolloClient({
    uri: "http://52.251.50.212:4000/",
    cache: new InMemoryCache(),
    headers: {
      Authorization: `Bearer ${userInfo.token}`
    }
  });
/*
  useFocusEffect(React.useCallback(()=>{
    // 이곳에서 refetch
    alert('SCREEN IS FOCUSED');
    return()=>{
      //alert("SCREEN WAS UNFOCUSED");
      setRefresh(!refresh);
    }
  },[])
  );
*/
  if(isFocused){
    colorIndex=0;
    return (
      <ApolloProvider client={client}>
        <Main navigation={navigation}/>
      </ApolloProvider>
    )
  }
  else{
    return <View></View>
  }
}

const styles = StyleSheet.create({
  adcard:{
    marginVertical: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  classboxText:{
    textAlign: "center",
    fontSize: 11,
  },
  classboxTextsmall:{
    textAlign: "center",
    fontSize: 6,
  },
  classbox: name => ({
    paddingHorizontal: 3,
    paddingVertical: 5,
    justifyContent: "center",
    //borderStyle: "dashed",
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: "#dcdcdc",
    backgroundColor: colorMap[name],
    flex: 1
  }),
  classbox2:{
    justifyContent: "center",
    //borderStyle: "dashed",
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: "#dcdcdc",
    flex: 1
  },
  weeklyHeader: {
    backgroundColor: "white",
    flexDirection: 'row',
    //borderStyle: "dashed",
    //borderWidth: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomColor: "#dcdcdc"
  },
  weeklyHeaderBox: {
    padding: 9,
    flex: 1
  },
  weeklyHeaderText: {
    textAlign: "center",
    fontWeight: "700"
  },
  scrollView: {
    height: 200
  },
  card2: {
    marginVertical: 5,
    marginHorizontal: 25,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 10,
    height: "40%"
  },
  card: {
    backgroundColor: "white",
    marginVertical: 5,
    marginHorizontal: 25,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 10,
  },
  date: {
    margin: 5,
    color: "blue",
    fontSize: 15,
    borderColor: "black",
    textAlign: "center",
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
  },
  button: {
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 10,
    //borderStyle:"dashed", 
    //borderWidth:1,
    padding:10,
    width: "40%",
    borderRadius: 10,
    backgroundColor: "#1478FF",
    borderColor: "white"
},
  adButton: {
    alignItems: 'center',
    justifyContent: "center",
    marginVertical: 10,
    marginHorizontal: 50,
    //borderStyle:"dashed", 
    //borderWidth:1,
    padding:10,
    borderRadius: 10,
    backgroundColor: "red",
    borderColor: "white"
  },
});