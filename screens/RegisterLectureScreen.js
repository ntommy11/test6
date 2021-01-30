import React from 'react';
import { UserContext } from '../components/context';
import { StyleSheet, Text, View, Button, TouchableOpacity, ActivityIndicator,ScrollView, Alert } from 'react-native';
import { ApolloClient, InMemoryCache, useQuery, ApolloProvider, useMutation } from "@apollo/client";
import { SEE_REGIST_LECTURE, SEE_REGIST_LECTURE_ONLY, TOGGLE_LECTURE, SEARCH_LECTURE } from '../queries';
import { SearchBar } from 'react-native-elements';
import { EvilIcons, MaterialIcons } from '@expo/vector-icons'
import { validate } from 'graphql';

const NOW = new Date();
const TIMEZONE = NOW.getTimezoneOffset()*60000;


function LectureCard({lecture, registered, class_list}){
  console.log("lecture: ", lecture);
  const [reg, setReg] = React.useState(registered);
  const [toggleLectureMutation] = useMutation(TOGGLE_LECTURE)

  const validate = ()=>{
    for(let i=0; i<lecture.classes.length; i++){
      if(lecture.classes[i].VOD == true) continue;
      let start_time = new Date(Number(lecture.classes[i].startTime)+TIMEZONE);
      //let end_time = new Date(Number(lecture.classes[i].endTime)+TIMEZONE);
      for (let j=0; j<class_list.length; j++){
        if (class_list[j].start_time < start_time && start_time < class_list[j].end_time) return false;
      }
    }
    return true;
  }

  const add = async () =>{
    try{
      console.log(lecture.id);
      let res = await toggleLectureMutation({
        variables:{
          LectureId: Number(lecture.id)
        }
      });
      setReg(true);
      console.log(res)
    }catch(e){
      console.log(e);
    }
  }
  if(reg){
    return(
      <View style={styles.card2}>
        <View style={{flex:8}}>
          <View style={{flexDirection:"row"}}>
            <Text style={styles.lectureCardName}>{lecture.name}</Text>
            {lecture.system == "VOD"? <MaterialIcons name="ondemand-video" size={16} color="red"/>: null}
          </View>
          <View style={{marginVertical:3}}>
            <Text>{lecture.professer}</Text>
          </View>
          <Text style={styles.lectureCardInfo}>{lecture.room} {lecture.subdivision} {lecture.code}</Text>
        </View>
        <View style={{flex:1, justifyContent:"center", alignItems:"center"}}>
          <TouchableOpacity>
            <EvilIcons name="check" size={32} color="green"/>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  return(
    <View style={styles.card2}>
      <View style={{flex:8}}>
        <View style={{flexDirection:"row"}}>
          <Text style={styles.lectureCardName}>{lecture.name}</Text>
          {lecture.system == "VOD"? <MaterialIcons name="ondemand-video" size={16} color="red"/>: null}
        </View>
        <View style={{marginVertical:3}}>
          <Text>{lecture.professer}</Text>
        </View>
        <Text style={styles.lectureCardInfo}>{lecture.room} {lecture.subdivision} {lecture.code}</Text>
      </View>
      <View style={{flex:1, justifyContent:"center", alignItems:"center"}}>
        {
          
        }
        <TouchableOpacity onPress={()=>{Alert.alert(
            "강의를 추가하시겠습니까?",
            "",
            [
              {
                text: "예",
                onPress: () => {
                  validate()?
                    add():Alert.alert("이미 수강하는 강의와 시간이 겹칩니다");
                },
                style: "cancel"
              },
              { text: "아니오", onPress: () => {return;} }
            ],
            { cancelable: true }
          );} }>
          <EvilIcons name="plus" size={32} color="blue"/>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function SearchResult({text, registeredId, class_list}){

  console.log("SearchResult::text=",text)
  const { data, loading, error } = useQuery(SEARCH_LECTURE, {
    variables: {
      text: text
    }
  });
  if(error){
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{error}</Text>
      </View>
    )   
  }
  if(loading){
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )   
  }
  if(data){
    console.log("SearchResult::data=",data);
    let lectures = data.searchLecture;
    console.log("SearchResult::lectures=", lectures);
    return(
      <ScrollView>
        {
          lectures.map((lecture, index)=>{
            let registered = false;
            if (registeredId.includes(lecture.id)){
              registered = true;
            }
            return(
              <LectureCard key={index} lecture={lecture} registered={registered} class_list={class_list}/>
            )
          })
        }
      </ScrollView>
    )
  }


}

function Main({navigation}){
    console.log("LectureScreen rendering");
    const [text, setText] = React.useState("");
    const handleTextChange = (val)=>{
      setText(val);
    }
    const { data, loading, error} = useQuery(SEE_REGIST_LECTURE);
    if(loading){
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      )    
    }
    if(error){
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>ERROR</Text>
        </View>
      )    
    }
    if(data){
      let lectures = data.seeRegistLecture;
      console.log("RegisterLectureScreen::Main::lectures=",lectures);
      let class_list = []; 
      for(let i=0; i<lectures.length; i++){
        let num_of_classes = lectures[i].classes.length;
        for(let j=0; j<num_of_classes; j++){
          if(lectures[i].classes[j].VOD) continue; // VOD는 시간표 겹치는지 체크할 필요 없다.
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
      console.log("RegisterLectureScreen::Main::class_list=", class_list);
      let registeredId = new Array();
      for(let i=0; i<lectures.length; i++){
        registeredId.push(lectures[i].id);
      }
      return(
        <View style={{ flex: 1}}>
          <SearchBar 
            placeholder="강의 찾기"
            containerStyle={{backgroundColor:"#eeeeee",borderTopWidth:0, borderBottomWidth:0,}}
            inputStyle={{backgroundColor:"#dcdcdc"}}
            inputContainerStyle={{backgroundColor:"#dcdcdc"}}
            onChangeText={(val)=>handleTextChange(val)}
            value={text}
          />
          <SearchResult text={text} registeredId={registeredId} class_list={class_list}/>
          <View style={{alignItems:"center", justifyContent:"center"}}>
            <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('ScheduleScreen')}>
              <Text style={{fontSize:20, color:"white"}}>돌아가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
  }
  
  export default function RegisterLectureScreen({navigation}) {
    const userInfo = React.useContext(UserContext);
    const client = new ApolloClient({
      uri: "http://52.251.50.212:4000/",
      cache: new InMemoryCache(),
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    });
  
    return (
      <ApolloProvider client={client}>
        <Main navigation={navigation}/>
      </ApolloProvider>
    )
  }

const styles = StyleSheet.create({
  lectureCardInfo:{
    fontSize:12,
    color:"grey",
  }, 
  lectureCardName:{
    fontSize:18,
    fontWeight:"600"
  },
  notificationList: {
    flexDirection: "row",
    padding: 3,
  },
  card2: {
    backgroundColor: "white",
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 25,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 10,
    textAlign: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "row"
  },
  card: {
    backgroundColor: "white",
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
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 10,
    borderStyle:"dashed", 
    borderWidth:1,
    padding:10,
    width: "80%",
    borderRadius: 10,
    backgroundColor: "#0A6EFF",
    borderColor: "white"
},
});
