import React, { useState, useEffect, useContext } from 'react';
import { AppRegistry } from 'react-native';
import { StyleSheet, Text, View, Button,ScrollView,TouchableOpacity,TextInput,Alert,KeyboardAvoidingView } from 'react-native';
import {colors, Header} from 'react-native-elements';
import { ApolloClient, ApolloProvider, InMemoryCache, useQuery , createHttpLink, useMutation} from "@apollo/client";

import { GET_CONTINENTS, GET_CONTINENT, SEE_REGIST_LECTURE, GET_USERID } from "../queries";
import { Appbar } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator,HeaderBackButton } from '@react-navigation/stack';

import { Ionicons } from '@expo/vector-icons';
import { AuthContext, UserContext,IdContext } from '../components/context';
import AsyncStorage from '@react-native-community/async-storage';

import HomeScreen from './HomeScreen';
import ScheduleScreen from './ScheduleScreen';
import {SEE_ALL_POSTERS,POST_VIEW,POST_UPLOAD,POST_DELETE,POST_LOAD,COMMENT_UPLOAD,COMMENT_DELETE,COMMENT_LOAD}from '../queries'
import { valueFromAST } from 'graphql';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ScreenStackHeaderLeftView } from 'react-native-screens';
 
var Bid//보드 아이디
var Uid// 유저 정보(id, grade)
var tnum //게시글/댓글 불러오는 수
var update = false;
var allComment = null;
const alaramBoard= [1,2];
const normalBoard =[3,4];

const check = (id) =>{//삭제버튼 띄우는 조건
 // console.log("check!!!!!!!!", id, Uid)
  if(Uid.id == id || (Bid in normalBoard && Uid.grade == 0 ) ) return true;
  else return false;
}

const UploadPostButton = ({navigation})=>{
  return (<View style={{borderWidth:1,position:'absolute',bottom:10,alignSelf:'center'}}>
  <Button
    title="글쓰기"
    accessibilityLabel="글쓰기"
    onPress={()=>{navigation.navigate("Upload")}}
    /> 
</View> );
}

function GetAllPost({route,navigation}){
  React.useLayoutEffect(() => {
    navigation.setOptions({

      headerRight: () => { //새로고침 버튼
        return (
          <Button title ="새로고침" onPress ={()=>{
            navigation.navigate("Community",{id:route.params.id, name:route.params.name})}} />
          )
        },
      headerTitle: ()=>(<Text>{route.params.name}</Text>) //커뮤니티 타이틀바꾸기
      
   });
     }, [navigation,route]);
  return(
    <View style={{flex:1}}>
    <ScrollView alwaysBounceVertical={true}>
      <GetPost snum={0} navigation={navigation}/>
    </ScrollView>
    {Bid in alaramBoard ? 
    Uid.grade == 0 ?
    <UploadPostButton navigation={navigation} /> : (null)
      :
    <UploadPostButton navigation={navigation} />    
    }
    </View>
  );

}

function GetPost({snum,navigation,child=false}){
    //더보기 버튼 누르면 더 불러옴.
   
    // console.log("getpost진입")
    const [EOS, setEOS] = useState(false)

    const{loading, error, data} = useQuery(POST_LOAD,{
        variables: {bid: Bid, snum: snum, tnum: tnum}
    });

    if(loading) return (<Text>로딩..</Text>);
    if(error) return(<Text>에러!!{error}</Text>);
    //console.log("eos::::",EOS);
    //console.log("@@@@@@@",data);
    return( 
    <View style ={{flex:1}}>
      <ScrollView alwaysBounceVertical={true}>
        {
        data.loadPost.map(post =>
          <TouchableOpacity 
            style={styles.line}
            onPress= {()=>{navigation.navigate("Post",{...post})}}
             key={post.id}>
            <Text style={{fontSize : 30}}>{post.title}</Text>
            <Text style={{fontSize : 13}}>{post.text}</Text>
            <Text style={{fontSize: 10}}>댓글수:{post.Comment.length}</Text>
            <Text style={{fontSize: 10}}>시간:{post.createdAt}</Text>
        </TouchableOpacity>
        )
         }{EOS?
          (<GetAllPost snum={snum+tnum} navigation={navigation}/>) :
          (
           data.loadPost.length < tnum ? (<Text>더 이상 불러올 글이 없습니다</Text>) : (<Button title ="더보기" onPress ={()=>setEOS(true)}/>)
           )
        }
      </ScrollView>
    </View>
      );

      //버튼 크기 up필요.가운데로 옮기기
}   
 

export function Community({route, navigation}){
  //console.log("Commnufdisufdfs",route);
  const userInfo = React.useContext(UserContext);
  const client = new ApolloClient({
    uri: "http://52.251.50.212:4000/",
    cache: new InMemoryCache(),
    headers: { 
       Authorization: `Bearer ${userInfo.token}`
      },
  })
  const Id =useContext(IdContext)
  Uid = Id
  Bid = route.params.id
  tnum = 20;
  return(
  <ApolloProvider client = {client}>
    <GetAllPost route={{...route}} navigation={navigation}/>
  </ApolloProvider>
   );

}
 
export function Post({route,navigation}){
  //console.log("------------Post----",route);
  
    const userInfo = React.useContext(UserContext);
    const Id = useContext(IdContext);
    Uid = Id;
    const client = new ApolloClient({
      uri: "http://52.251.50.212:4000/",
      cache: new InMemoryCache(),
      headers: { 
         Authorization: `Bearer ${userInfo.token}`
        },
    })
  
    return(
      <ApolloProvider client = {client}>
        <ViewPost route ={{...route}} navigation={navigation} />
    </ApolloProvider>    
  );
   
  }
  
 
const SetHeader = ({route,navigation,deletePost})=>{ //새로고침,삭제 헤더버튼 추가.
  //console.log("hedear----------------------",route);
  React.useLayoutEffect(() => {
    navigation.setOptions({

      headerRight: () => {
        
        return (
        <View style={{flexDirection:'row'}} >
          <Button title ="새로고침" onPress ={()=>{
            navigation.setParams({upload:true})
            navigation.navigate("Post")}} />
          {check(route.userId) ?
          (<Button title="삭제" onPress={()=>{Alert.alert(
            "글을 삭제하시겠습니까?",
            "",
            [
              {
                text: "예",
                onPress: () => {
                  deletePost(route.id);
                  navigation.navigate("Community",{id:Bid})},
                style: "cancel"
              },
              { text: "아니오", onPress: () => {return;} }
            ],
            { cancelable: true }
          );} }/>)

          :

          (null)
          }
          </View>)},

       headerLeft :()=>{//console.log("정신나갈거같에정시난갈거같에정신",route.upload)
       return (route.upload == true) ? (<HeaderBackButton onPress={()=>{navigation.navigate("Community",{id:Bid})}}/>) 
                    :(<HeaderBackButton onPress={()=>{navigation.goBack()}} />)
                  }
      
   } );
     }, [navigation,route]);
     return(null);
}


function ViewPost({route,navigation}){//한 Post 다 출력
  //console.log("----------viewpoint rotue-------------",route)
  const cond = (route.params.upload == true) 
  const [deletePostMutation] = useMutation(POST_DELETE);
  const deletePost = async(pid) =>{
      try{
      const data = await deletePostMutation({
        variables: {
          pid: pid
        }
      }
    )} 
    catch(e){
      console.log(e); 
      }
  }  
  const [uploadMutation] = useMutation(COMMENT_UPLOAD);//
  const uploadComment = async(pid,text) =>{
      try{
      const data = await uploadMutation({
        variables: {
          pid: pid,
          text: text
        }
      }
    );
  }
    catch(e){
      console.log(e); 
      }
  }  

  const [deleteCommentMutatin] = useMutation(COMMENT_DELETE);
  const deleteComment = async(cid) =>{
    try{
    const data = await deleteCommentMutatin({
      variables: {
        cid: cid
      }
    }
  );
}
  catch(e){
    console.log(e); 
    }
}  
 
if(!cond ){
allComment = route.params.Comment;
}

  return(
  <View style ={{flex:1}}>
  <ScrollView automaticallyAdjustContentInsets={false}>
    <View >
      <SetHeader route={{id: route.params.id , upload: route.params.upload, userId: route.params.UserId}}
       navigation={navigation} deletePost={deletePost}/>
      {cond?
      <CommentReload route ={{id: route.params.id, userId: route.params.UserId, 
        text:route.params.text, title:route.params.title,
        createdAt : route.params.createdAt
      }}
       deleteComment={deleteComment} navigation ={navigation}/>
      :
      <View>
      <PostStyle route={{text:route.params.text, title:route.params.title, commentLen: route.params.Comment.length,
        createdAt:route.params.createdAt}}/>
      <CommentStyle route={{userId : route.params.UserId}} snum={0} deleteComment={deleteComment} navigation = {navigation} />
      </View> 
      }
    </View>
  </ScrollView>
  <View style={{borderWidth:1,position:'absolute',bottom:10 ,alignSelf:'stretch'}}>
      <CommentInput  route={{id: route.params.id}} upload = {uploadComment} navigation ={navigation}/>
  </View>
  </View>);
} 
 
const CommentReload = ({route,deleteComment, navigation}) =>{
  //console.log("Reloo가쟈!!!!route ", route)

  const{loading, error, data} = useQuery(POST_VIEW,{ //댓글 불러오는 쿼리
    variables: {pid: route.id}
  })
  if(loading) return (<Text>로딩..</Text>);
  if(error) return(<Text>에러!!{error}</Text>);
  //console.log(data);
  allComment = data.seeAllComment 

  return(
    <ScrollView>
    <PostStyle route={{text:route.text, title:route.title, commentLen: data.seeAllComment.length,
        createdAt:route.createdAt}}/>
    <CommentStyle route={{userId: route.userId}} snum={0} deleteComment={deleteComment} navigation ={navigation}/>
    </ScrollView>

  );
}


const CommentInput=({route,upload,navigation})=>
{
  
  const [text,setText] = useState("");
  //console.log("Commentinput!!!",route);
  return (
    <View style={{flexDirection:'row'}}>
  <TextInput 
     placeholder="댓글을 입력하세요."
     onChangeText={(val)=>setText(val)}
      />
  <Button title="입력" onPress={()=>{
    //console.log("------------------------",route)
    upload(route.id, text);
    navigation.navigate("Post",{upload : true})

  }} />
     </View>);

}
  

const CommentStyle = ({route, snum, deleteComment, navigation, child=false} ) => {

  const [EOS, setEOS] = useState(false)
  const slice = allComment.slice(snum, snum+tnum);
  //console.log("Commentsytel@@@Slice",slice)
  return(
    <View>
      {slice.map((comment)=><CommentContent route={route} 
          comment={comment} deleteComment={deleteComment} navigation={navigation} key={comment.id}/>)}
      {EOS?
          (<CommentStyle route={{...route}} snum={snum+tnum} deleteComment={deleteComment} navigation={navigation} child={true}/>) :
          (
           slice.length < tnum ? (<Text>더 이상 불러올 글이 없습니다</Text>) : (<Button title ="더보기" onPress ={()=>setEOS(true)}/>)
           )
          } 
    </View>
  );




}


const CommentContent = React.memo(({route,comment,deleteComment,navigation}) => {
 // console.log("Commentfdsfdsfdsfqfqefqf",route);
  return(
    <View style={styles.line}>
    <Text style={{fontSize:15}}>익명</Text>
    <Text style={{fontSize:20}}>{comment.text}{"\n"}</Text>
    <Text style={{fontSize:10}}>시간{comment.createdAt}</Text>
    { (check(route.userId))?
    <Button title="삭제" onPress={()=>
    {
      deleteComment(comment.id);
      navigation.navigate("Post",{upload: true});
    }}/> : (null)
  }
    </View>


  );
})
 
const PostStyle = ({route}) => {
  //console.log("poststtstdsgsijfsifjd!!!",route);
  return(
    <View style={styles.line}>
    <Text style={{fontSize:20}}>익명{"\n"}</Text>
    <Text style={{fontSize:10}}>시간{route.createdAt}</Text>
    <Text style={{fontSize:35}}>{route.title}</Text>
    <Text style={{fontSize:20}}>{route.text}</Text>
    <Text style={{fontSize:10}}>댓글수{route.commentLen}</Text>
    </View>
  );
} 


const CheckUpload = ({navigation}) => {
  //console.log("eeeeee",bid,typeof(bid));
  const [uploadmutation] = useMutation(POST_UPLOAD);
  const upload = async({bid, title, text}) =>{
    try{
    const data = await uploadmutation({
      variables: {
        bid: Bid,
        title: title,
        text: text
      }
    }
  )}
  catch(e){
    console.log(e); }
  }
  return(<UpdateScreen navigation={navigation} upload={upload} />);
}

export function Upload({route,navigation}) {  
  const userInfo = React.useContext(UserContext);
  const client = new ApolloClient({
    uri: "http://52.251.50.212:4000/",
    cache: new InMemoryCache(),
    headers: {
       Authorization: `Bearer ${userInfo.token}`
      },
  })

  return(<ApolloProvider client={client}>
    <CheckUpload navigation ={navigation} />
    </ApolloProvider>
  );
}

const UpdateScreen = ({navigation, upload})=>{
  const [title,setTitle] = useState("");
  const [text, setText] = useState("");

  return(<KeyboardAwareScrollView>

      <View style={{marginTop:30, flexDirection:'row',justifyContent:'space-between'}}>
  <Button title="X" onPress={()=>{
    navigation.goBack()
   }} />
  <Text>글쓰기</Text>
  <Button title="완료"  onPress={() =>{
    if(title =="" || text =="") alert("제목, 글 모두 다 입력하세요.")
    else{
      upload({Bid,title,text});
      navigation.navigate("Community",{id: Bid})
    }   
  }} />
  </View >
  <TextInput 
        style={{
          textAlignVertical: "top",
        }}
    placeholder="제목"
    autoCapitalize="none"
    onChangeText={(val)=>setTitle(val)}
    value={title}
     />
  <TextInput 
        style={{
          textAlignVertical: "top",
        }}
    placeholder="내용"
    autoCapitalize="none"
    onChangeText={(val)=>setText(val)}
    multiline={true}

    value={text}
     />

</KeyboardAwareScrollView>
  );
}

 
const styles = StyleSheet.create({

  line: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    width: "90%",
    color: '#05375a',
},
});



