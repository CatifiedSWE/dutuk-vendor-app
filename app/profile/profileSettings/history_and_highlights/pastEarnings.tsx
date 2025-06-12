import DisplayEarnings from "@/components/DisplayEarnings";
import pastEarnings from "@/dummy_data/pastEarnings";
import { View } from "react-native";


const PastEarnings = ()=>{
    const data = pastEarnings;
    return(
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <DisplayEarnings earnings={data} />
        </View>
    )
}
export default PastEarnings;