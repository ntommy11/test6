import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Dimensions,
    StyleSheet,
    StatusBar,
    Image,
    Button,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@react-navigation/native';

const SplashScreen = ({navigation}) => {
    console.log("SplashScreen rendering");

    const { colors } = useTheme();

    return (
        <View style={styles.container}>
        <View style={styles.header}>
            {<Image source={require('../assets/logo3.png')}/>
            }
            <View style={{marginTop:10}}>
                <Text style={{fontWeight:"800", color:"white"}}>미래융합대학</Text>
            </View>
        </View>
        <Animatable.View style={styles.footer} animation="fadeInUpBig">
            <Text style={styles.title}>학교생활도우미</Text>
            <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('SignInScreen')}>
                    <Text style={{fontSize:20, color:"white"}}>시작하기</Text>
            </TouchableOpacity>
        </Animatable.View>
      </View>
    );
};

export default SplashScreen;

const {height} = Dimensions.get("screen");
const height_logo = height * 0.18;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#0A6EFF',
  },
  header: {
      flex: 2,
      justifyContent: 'center',
      alignItems: 'center'
  },
  footer: {
      flex: 1,
      backgroundColor: '#fff',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingVertical: 50,
      paddingHorizontal: 30,
      alignItems: "center"
  },
  logo: {
      width: height_logo,
      height: height_logo
  },
  title: {
      textAlign: "center",
      color: '#05375a',
      fontSize: 30,
      fontWeight: 'bold',
      marginBottom: 30,
  },
  text: {
      color: 'grey',
      marginTop:5
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
  signIn: {
      width: 150,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 50,
      flexDirection: 'row'
  },
  textSign: {
      color: 'white',
      fontWeight: 'bold'
  }
});