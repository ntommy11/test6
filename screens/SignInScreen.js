import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    TextInput,
    Platform,
    StyleSheet ,
    StatusBar,
    Button,
    Alert
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { MaterialIcons, Feather } from '@expo/vector-icons'
import { Input } from 'react-native-elements';

import { AuthContext } from '../components/context';




const SignInScreen = ({navigation}) => {
    console.log("SignInScreen rendering");

    const [data, setData] = React.useState({
        username: '',
        password: '',
        check_text: false,
    });


    const textInputChange = (val) => {
        if (val.length !== 0){
            setData({
                ...data,
                username: val,
                check_text: true
            });
        }else{
            setData({
                ...data,
                username: val,
                check_text: false
            }); 
        }
    }

    const handleUsernameChange = (val) => {
        setData({
            ...data,
            username: val
        })
    }
    const handlePasswordChange = (val) => {
        setData({
            ...data,
            password: val
        })
    }
    const { signIn } = React.useContext(AuthContext);
    const { userEmail } = React.useContext(AuthContext);
    //console.log(userEmail);
    const handleLogin = (username,password) => {
        signIn(username,password);
    }

    return (
      <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.text_header}>환영합니다!</Text>
          </View>
          <Animatable.View style={styles.footer} animation="fadeInUpBig">
            <Text style={styles.text_footer}>이메일</Text>
            <View style={styles.action}>
                <TextInput 
                    placeholder="이메일을 입력하세요"
                    style={styles.TextInput}
                    autoCapitalize="none"
                    onChangeText={(val)=>textInputChange(val)}
                ></TextInput>
                <Feather name="check-circle" color="#1478FF" size={2}/>      
            </View>
            <Text style={[styles.text_footer, {marginTop:35}]}>비밀번호</Text>
            <View style={styles.action}>
                <TextInput 
                    placeholder="비밀번호를 입력하세요"
                    style={styles.TextInput}
                    autoCapitalize="none"
                    secureTextEntry={true}
                    size={20}
                    onChangeText={(val)=>handlePasswordChange(val)}
                ></TextInput>
                <Feather name="check-circle" color="#1478FF" size={2}/>      
            </View>

            <View style={{alignItems:"center"}}>
                <TouchableOpacity style={styles.button} onPress={()=>{handleLogin(data.username, data.password)}}>
                    <Text style={{fontSize:20, color:"white"}}>로그인</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button2} onPress={()=>navigation.navigate('SignUpScreen')}>
                    <Text style={{fontSize:20, color:"#1478FF"}}>가입하기</Text>
                </TouchableOpacity>
            </View>

            </Animatable.View>

          
      </View>
    );
};

export default SignInScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: '#0A6EFF',
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 50
    },
    footer: {
        flex: 3,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 30,
    },
    text_header: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 30
    },
    text_footer: {
        color: '#1478FF',
        fontSize: 18
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
    actionError: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FF0000',
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        width: "90%",
        color: '#05375a',
    },
    errorMsg: {
        color: '#FF0000',
        fontSize: 14,
    },
    button: {
        alignItems: 'center',
        marginTop: 10,
        //borderStyle:"dashed", 
        //borderWidth:1,
        padding:10,
        width: "80%",
        borderRadius: 10,
        backgroundColor: "#0A6EFF",
        borderColor: "white"
    },
    button2: {
        alignItems: 'center',
        marginTop: 10,
        //borderStyle:"dashed", 
        borderWidth:1,
        padding:10,
        width: "80%",
        borderRadius: 10,
        borderColor: "#0A6EFF",
    },
    signIn: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    textSign: {
        fontSize: 18,
        fontWeight: 'bold'
    }
  });