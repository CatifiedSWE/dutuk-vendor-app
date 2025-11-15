// BACKEND INTEGRATION COMMENTED OUT - USING ASYNCSTORAGE FOR LOCAL STORAGE
// import customStyle from "@/assets/customStyle";
// import getStoredDates from "@/hooks/getStoredDates";
// import storeDates from "@/hooks/useStoreDates";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View, Pressable } from "react-native";
import { Calendar } from "react-native-calendars";
import { 
  getCalendarDates, 
  setCalendarDate, 
  removeCalendarDate, 
  isPastDate,
  CalendarDate,
  CalendarDateStatus 
} from "@/utils/calendarStorage";
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';


const CalendarPage = ()=>{

    type MarkedDateType = {
  [date: string]: {
    dots?: { key: string; color: string }[];
    periods?: { startingDay?: boolean; endingDay?: boolean; color: string }[];
    customStyles?: {
      container?: {
        borderRadius?: number;
        borderWidth?: number;
        borderColor?: string;
        backgroundColor?: string;
      };
      text?: {
        color?: string;
        fontWeight?: string;
      };
    };
  };
};  
    const [isAllowed,setAllowed] = useState(false);
    const [calendarDates, setCalendarDates] = useState<CalendarDate[]>([]);

    // BACKEND CALL COMMENTED OUT - NOW USING ASYNCSTORAGE
    const getDates = async()=>{
        try {
          // Backend version (commented out):
          // let dates = await getStoredDates();
          // console.log(dates);
          // let correctDates: any[] | ((prevState: string[]) => string[]) =[];
          // dates?.forEach((obj)=>correctDates.push(obj.date));
          // setMarked(correctDates);
          
          // AsyncStorage version:
          const storedDates = await getCalendarDates();
          console.log('Loaded dates from AsyncStorage:', storedDates);
          setCalendarDates(storedDates);
          setAllowed(true);
        } catch (error) {
          console.error('Error loading dates:', error);
          setAllowed(true);
        }
    }

    // Convert calendar dates to marked dates format
    const markedDates: MarkedDateType = calendarDates.reduce((acc, calDate) => {
      if (calDate.status === 'unavailable') {
        // Unavailable: red text
        acc[calDate.date] = {
          customStyles: {
            text: {
              color: '#FF3B30',
              fontWeight: '700',
            },
          },
        };
      } else if (calDate.status === 'available') {
        // Available: black circle with white text
        acc[calDate.date] = {
          customStyles: {
            container: {
              backgroundColor: '#000000',
              borderRadius: 20,
            },
            text: {
              color: '#FFFFFF',
              fontWeight: '700',
            },
          },
        };
      }
      return acc;
    }, {} as MarkedDateType);
    
    useEffect(()=>{
        getDates();
    },[])

    if(isAllowed){

    return(
        
        <View style={style.container}>
        
            <Calendar 

            markingType={"custom"}

            onDayPress={async (day)=>{
                if(marked.includes(day.dateString)) {
                    
                      Alert.alert(
                        'Confirmation',
                        'Are you sure to remove the date',
                [
                    {
                    text: 'Cancel',
                    style: 'cancel',
                    },
                    {
                    text:'Confirm',
                    onPress:()=> setMarked(marked.filter((i)=> i!==day.dateString)),
                    style:'default'
                    }
                ],
                {
                cancelable: true,
    },
  ); 
                }
                else setMarked([...marked,day.dateString]);
               await storeDates(day.dateString);
            }}

            style={style.calendar} 

            onDayLongPress={async(date)=>{
                if(!marked.includes(date.dateString)){
                    setMarked([...marked,date.dateString]);
                    await storeDates(date.dateString);
                }
                router.push({pathname:"/profilePages/calender/CalendarRedirect",params:{date:date.dateString}})
            }}
              

            markedDates={{
                ...markedDates,
        }}
            /> 
       

        </View>

        
    )
}
    else{
        return(
             <View style={style.container}>
                <Text>Loading</Text>
             </View>
        )
    }
}
const style = StyleSheet.create({
    container:{
        flex:1,
        alignItems:"center",
        justifyContent:"center"
    },
    calendar:{
        width:300,
        borderCurve:"circular",
        borderRadius:10
    }
})
export default CalendarPage;