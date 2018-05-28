import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  NetInfo,
  Alert,
  ActivityIndicator
} from 'react-native';
import { createStackNavigator } from 'react-navigation';
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
} from 'react-native-admob'

let deviceWidth = Dimensions.get('window').width


class Channels extends Component{
  constructor(props){
    super(props)
    this.state = {
      dataSource : []
    }
  }

  showAd = ()=>{
    AdMobInterstitial.setAdUnitID('ca-app-pub-3940256099942544/1033173712');
    AdMobInterstitial.setTestDevices([AdMobInterstitial.simulatorId]);
    AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd())
  }

  showRewardAd= ()=>{
    AdMobRewarded.setAdUnitID('ca-app-pub-3940256099942544/5224354917');
    AdMobRewarded.requestAd().then(() => AdMobRewarded.showAd())
  }

  componentDidMount(){
    return fetch('http://159.89.172.199/tvlisting_categories')
      .then((response) => response.json())
      .then((responseJson) => {
        let sortedData = responseJson.sort((a,b)=> b.popular-a.popular)
        this.setState({
          dataSource: sortedData,
        }, function(){

        });

      })
      .catch((error) =>{
        console.error(error);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          style={styles.container}
          data={this.state.dataSource}
          renderItem={({item}) => (
            <TouchableOpacity onPress={()=>{
              this.showRewardAd()
              this.props.navigation.push('Programs', item)
            }}>
              <View style={styles.item}>
                <Image style={styles.channel_logo} source={{uri: item.channel_logo}} resizeMode='contain'/>
                <Text style={styles.channel_name}>{item.channeldisplayname}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.channeldisplayname}
          numColumns={3} />
          <AdMobBanner
              adSize="fullBanner"
              adUnitID="ca-app-pub-3940256099942544/6300978111"
              testDevices={[AdMobBanner.simulatorId]}
              onAdFailedToLoad={error => console.error(error)}
            />
      </View>
    );
  }
}

class Programs extends Component{
  constructor(props){
    super(props)
    this.state = {
      dataSource : [],
      isLoading: false
    }
  }

  componentDidMount(){
    const {params} = this.props.navigation.state
    console.warn(params);
    return fetch('http://159.89.172.199/tvlisting?channel='+params.channeldisplayname)
      .then((response) => response.json())
      .then((responseJson) => {
        let val = responseJson.sort((a, b) => parseFloat(a.start) - parseFloat(b.start))
        this.setState({
          dataSource: val,
        }, function(){

        });

      })
      .catch((error) =>{
        console.error(error);
      });
  }

  showInterstitialAd = ()=>{
    AdMobInterstitial.setAdUnitID('ca-app-pub-3940256099942544/1033173712');
    AdMobInterstitial.setTestDevices([AdMobInterstitial.simulatorId]);
    AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd())
  }

  showRewardAd= ()=>{
    AdMobRewarded.setAdUnitID('ca-app-pub-3940256099942544/5224354917');
    AdMobRewarded.requestAd().then(() => AdMobRewarded.showAd())
  }


  loading = ()=>{
    if (this.state.isLoading){
      return (
        <View style={{position: 'absolute', top: 0, left: 0,right:0,bottom:0, alignItems: 'center', justifyContent: 'center'}}>
          <View style={{backgroundColor: 'white', width: 250, height: 100, borderColor: '#666', borderWidth: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontSize: 16, color: '#000'}}>Please Wait!</Text>
            <Text style={{fontSize: 14, color: '#000'}}>connecting to server</Text>
            <ActivityIndicator size="small" color="#000" />
          </View>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          style={styles.container}
          data={this.state.dataSource}
          renderItem={({item}) => (
            <View>
              <TouchableOpacity
                style={styles.program}
                onPress={()=>{
                NetInfo.isConnected.fetch().then(isConnected => {
                  if (!isConnected){
                    Alert.alert(
                      'No Internet Connection',
                      'Please connect to internet to watch this program',
                      [
                        {text: 'OK'},
                      ],
                    )
                  }else{
                    this.setState({isLoading: true})
                    this.showRewardAd()
                    setTimeout(() => {
                      this.setState({isLoading: false})
                      Alert.alert(
                        'Server is Busy',
                        'server is busy because of high traffic. would you like to try again?',
                        [
                          {text: 'No', onPress: () => {
                            this.showRewardAd()
                          }},
                          {text: 'Yes', onPress: () => {
                            this.showRewardAd()
                            this.setState({isLoading: true})
                          }},
                        ],
                      )
                    }, 10000)
                  }
                }).catch(err=>console.error(err))
              }}>
                <Image style={styles.channel_logo} source={{uri: item.program_logo}} resizeMode='contain'/>
                <View style={{flexDirection:'column', alignItems:'flex-start', padding: 16}}>
                  <Text style={{fontSize: 20}}>{item.start}</Text>
                  <Text style={styles.channel_name}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={item => item.title}
          ItemSeparatorComponent={()=>{
            return(
              <View style={{backgroundColor: '#666', height: 1}}/>
            )
          }}
        />
        <AdMobBanner
            adSize="fullBanner"
            adUnitID="ca-app-pub-3940256099942544/6300978111"
            testDevices={[AdMobBanner.simulatorId]}
            onAdFailedToLoad={error => console.error(error)}
          />
        {this.loading()}
      </View>
    );
  }
}

const RootStack = createStackNavigator({
  Home: Channels,
  Programs: Programs
});


export default class App extends Component {
  render() {
    return (
      <RootStack/>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
    item: {
        width: (deviceWidth/3)-10,
        height: (deviceWidth/3)+40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        margin: 5,
        backgroundColor: '#fff',
        borderColor: '#999'
    },
    channel_logo: {
      width: (deviceWidth/3)-20,
      height: (deviceWidth/3)-20
    },
    channel_name:{
      fontWeight: 'bold',
      textAlign: 'center'
    },
    program:{
      flexDirection: 'row',
      backgroundColor: '#fff'
    }
});
