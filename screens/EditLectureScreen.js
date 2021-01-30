import React from 'react';
import { UserContext } from '../components/context';
import { StyleSheet, Text, View, Button, TouchableOpacity, ActivityIndicator,ScrollView, Alert } from 'react-native';
import { ApolloClient, InMemoryCache, useQuery, ApolloProvider, useMutation } from "@apollo/client";
import { SEE_REGIST_LECTURE_ONLY, TOGGLE_LECTURE } from '../queries';
import { Icon } from 'react-native-elements';
import { EvilIcons, MaterialIcons } from '@expo/vector-icons'

function LectureCard({navigation,lecture}){
  console.log("lecture: ", lecture);
  const [reg,setReg] = React.useState(true);
  const [toggleLectureMutation] = useMutation(TOGGLE_LECTURE)

  const remove = async () =>{
    try{
      console.log(lecture.id);
      let res = await toggleLectureMutation({
        variables:{
          LectureId: Number(lecture.id)
        }
      });
      console.log(res)
      setReg(false);
    }catch(e){
      console.log(e);
    }
  }
  if(!reg){
    return(
      <View>
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
        <TouchableOpacity onPress={()=>{Alert.alert(
            "강의를 삭제하시겠습니까?",
            "",
            [
              {
                text: "예",
                onPress: () => {
                  remove();
                  navigation.navigate("EditLectureScreen")
                },
                style: "cancel"
              },
              { text: "아니오", onPress: () => {return;} }
            ],
            { cancelable: true }
          );} }>
          <EvilIcons name="minus" size={32} color="red"/>
        </TouchableOpacity>
      </View>
    </View>
  )
}



function Main({navigation}){
    console.log("LectureScreen rendering");
    const [text, setText] = React.useState(null);
    
    const { loading, error, data } = useQuery(SEE_REGIST_LECTURE_ONLY);
    if(loading){
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      )    
    }
    if(error){

    }
    if(data){
      let lectures = data.seeRegistLecture;

      console.log("lectures in EditLectureScreen:", lectures);
      return(
        <View style={{flex:1}}>
          <View style={{marginVertical:20}}>
            <Text style={{textAlign:"center", fontSize:20, fontWeight:"700"}}>내 강의 목록</Text>
          </View>
          <ScrollView>
            {
              lectures.map((lecture, index)=>{
                return <LectureCard key={index} lecture={lecture} navigation={navigation}/>
              })
            }
          </ScrollView>
          <View style={{alignItems:"center", justifyContent:"center"}}>
            <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('ScheduleScreen')}>
              <Text style={{fontSize:20, color:"white"}}>돌아가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    return(
      <View style={{ flex: 1}}>
        <Text>내 강의</Text>
        <Button title="back" onPress={()=>navigation.navigate("ScheduleScreen")} />
      </View>
    )
  }
  
export default function EditLectureScreen({navigation}) {
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
    backgroundColor: "#1478FF",
    borderColor: "white"
},
});
