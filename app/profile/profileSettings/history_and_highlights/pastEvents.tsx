import DisplayEvents from "@/components/DisplayEvents";
import pastEventsData from "@/dummy_data/pastEventsData";
import { View } from "react-native";

const PastEvents = ()=>{
    //getting the dummy data
    const data = pastEventsData;
    return(
        <View>
            <DisplayEvents events={data}/>
        </View>
    )
}
export default PastEvents;