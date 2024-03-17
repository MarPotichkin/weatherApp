import { View, Text, SafeAreaView, Image, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../theme';
import { debounce } from 'lodash';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { CalendarDaysIcon, MapPinIcon} from 'react-native-heroicons/solid';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { weatherImageDay, weatherImageNight } from '../constants';
import * as Progress from 'react-native-progress';
import { getData, storeData } from '../utils/asyncStorage';

export default function HomeScreen() {
    const [showSearch, setShowSearch] = useState(false);
    const [locations, setLocations] = useState([]);
    const [weather, setWeather] = useState({});
    const [loading, setLoading] = useState(true)
    
    // const [keyboardOffset, setKeyboardOffset] = useState(0);

    // useEffect(() => {
    //   const keyboardDidShowListener = Keyboard.addListener(
    //     'keyboardDidShow',
    //     (event) => {
    //       setKeyboardOffset(event.endCoordinates.height); // Calcula el desplazamiento del teclado
    //     }
    //   );
  
    //   const keyboardDidHideListener = Keyboard.addListener(
    //     'keyboardDidHide',
    //     () => {
    //       setKeyboardOffset(0); // Reinicia el desplazamiento del teclado cuando se oculta
    //     }
    //   );
  
    //   return () => {
    //     keyboardDidShowListener.remove();
    //     keyboardDidHideListener.remove();
    //   };
    // }, []);

    const handleLocation = async(loc) => {
        console.log("location", loc)
        setShowSearch(false)
        setLocations([]);
        setLoading(true)
        const data = await fetchWeatherForecast({cityName: loc.name, days: '7'})
        setWeather(data)
        setLoading(false)
        storeData('city', loc.name)
        console.log("result", data);
    }
    
    const handleSearch = async(value) => {
        if(value.length >2){
            try {
                const data = await fetchLocations({cityName: value})
                console.log(data);
                setLocations(data)     
            } catch (e) {
                console.log(e);
            }
        }
        // console.log(value)
    }
    
    useEffect(() => {
        fetchMyWeatherData();
    },[])

    const fetchMyWeatherData = async () => {
        let myCity = await getData('city')
        let cityName = 'Mendoza'
        if(myCity) cityName = myCity
        const data = await fetchWeatherForecast({
            cityName,
            days: '7'
        })
        setWeather(data)
        setLoading(false)
    }

    const handleTextDebounce = useCallback(debounce(handleSearch, 600), []);

    const {current, location} = weather;

    return(
        <View className="flex flex-1 relative bg-slate-900">

            <StatusBar style='light' />
            {/* <Image blurRadius={300} source={require('../assets/background.jpg')} className="absolute h-full w-full scale-110"/> */}
            { loading 
                ? (
                    <View className="flex-1 flex-row justify-center items-center">
                        {/* <Text className="text-white text-4xl">Loading...</Text> */}
                        <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />                    
                    </View>
                ) 
                : (
                    <SafeAreaView className="flex flex-1 mt-12">

                        {/* SECCIÓN BARRA DE BÚSQUEDA */}
                        <View style={{height: '7%'}} className="mx-4 relative z-50">
                            <View className="flex-row justify-end items-center rounded-full" style={{backgroundColor: showSearch ? theme.bgWhite(0.2) : "transparent"}}>
                                {
                                    showSearch 
                                    && <TextInput onChangeText={handleTextDebounce} placeholder='Buscar ciudad' placeholderTextColor={'lightgray'} className="pl-6 h-10 flex-1 text-base text-white"/>
                                }
                                <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={{backgroundColor: theme.bgWhite(0.3)}} className="rounded-full p-3 m-1">
                                    <MagnifyingGlassIcon size="25"color="white"/>
                                </TouchableOpacity>
                                {
                                    locations.length >0 && showSearch ?
                                        <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                                            {
                                                locations.map((loc, index) => {
                                                    let showBorder = index+1 != locations.length;
                                                    let borderClass = showBorder ? 'border-b-2 border-b-gray-400' : ''
                                                    return(
                                                        <TouchableOpacity onPress={() => handleLocation(loc)} key={index} className={"flex-row items-center, border-0 p-3 px-4 mb-1 "+ borderClass}>
                                                            <MapPinIcon size="20" color="gray"/>
                                                            <Text className="text-black text-lg ml-2">{loc?.name}, {loc?.country}</Text>
                                                        </TouchableOpacity>
                                                    )
                                                })
                                            }
                                        </View>
                                    : null
                                }
                            </View>
                        </View>

                        {/* SECCIÓN DE PRONOSTICO */}
                        <ScrollView className="absolute mt-16 flex h-screen w-screen">
                            <View className=" flex flex-1 gap-8 mb-4 mt-2 mx-4 justify-center items-center">
                                <Text className="text-white text-2xl font-bold">{location?.name},
                                    <Text className="text-lg font-semibold text-gray-300"> {location?.country}</Text>
                                </Text>
                                <View className="flex-row ">
                                    { current?.is_day == 0 
                                    ? <Image 
                                    source={weatherImageNight[current?.condition?.code]}
                                    className="w-52 h-52"/>
                                    : 
                                    <Image 
                                    source={weatherImageDay[current?.condition?.code]}
                                    // source={{uri: 'https://'+current?.condition?.icon}}
                                    // source={require('../assets/images/partlycloudy.png')} 
                                    className="w-52 h-52"/>
                                    }
                                </View>
                                <View className="space-y-2">
                                    <Text className="font-bold text-center text-white text-6xl">{current?.temp_c}&#176;</Text>
                                    <Text className="text-white  text-xl tracking-widest">{current?.condition?.text}</Text>
                                </View>
                                <View className="flex-row space-x-4 ">
                                    <View className="flex-row space-x-2">
                                        <Image source={require('../assets/icons/wind.png')} className="h-6 w-6 "/>
                                        <Text className="text-white font-semibold text-base">{current?.wind_kph}km</Text>
                                    </View>
                                    <View className="flex-row space-x-2 ">
                                        <Image source={require('../assets/icons/drop.png')} className="h-6 w-6 "/>
                                        <Text className="text-white font-semibold text-base">{current?.humidity}%</Text>
                                    </View>
                                    <View className="flex-row space-x-2 ">
                                        <Image source={require('../assets/icons/sun.png')} className="h-6 w-6 "/>
                                        <Text className="text-white font-semibold text-base">{weather?.forecast?.forecastday[0]?.astro?.sunrise}</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="mb-2 space-y-3">
                                <View className="flex-row items-center mx-5 space-x-2">
                                    <CalendarDaysIcon size="22" color="white" />
                                    <Text className="text-white text-base">Próximos días</Text>
                                </View>
                                <ScrollView horizontal contentContainerStyle={{paddingHorizontal: 15}} showsHorizontalScrollIndicator={false}>
                                    {weather?.forecast?.forecastday?.map((item, index) => {
                                        let date = new Date(item.date)
                                        let options = {weekday: 'long'}
                                        let dayName = date.toLocaleDateString('es-AR', options)
                                        return (
                                            <View key={index} className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4" style={{backgroundColor: theme.bgWhite(0.15)}}>
                                                <Image source={weatherImageDay[item?.day?.condition?.code]} className="h-11 w-11" />
                                                <Text className="text-white">{dayName}</Text>
                                                <Text className="text-white text-xl font-semibold">{item?.day?.avgtemp_c}&#176;</Text>
                                            </View>
                                        )})
                                    }                        
                                </ScrollView>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                )
            }
        </View>
            
        // </KeyboardAvoidingView>
    )
}