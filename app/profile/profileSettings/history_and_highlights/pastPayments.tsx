import DisplayPayments from "@/components/DisplayPayments";
import pastPayments from "@/dummy_data/pastPaymentsData";
import { View } from "react-native";

const PastPayments = ()=>{
    const data = pastPayments;
    return(
        <View>
            <DisplayPayments payments={data} />
        </View>
    )
}
export default PastPayments;