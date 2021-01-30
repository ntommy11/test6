import React from 'react';
import {Header} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';

export default HeaderScreen = (navigation) =>{
    return(
        <Header
            leftComponent={{ icon: 'menu', color: '#fff' }}
            centerComponent={{ text: 'MY TITLE', style: { color: '#fff' } }}
            rightComponent={<Icon.Button name="ios-menu" size={25} backgroundColor="#009387" onPress={() => navigation.openDrawer()}></Icon.Button>}
        />
    )
}