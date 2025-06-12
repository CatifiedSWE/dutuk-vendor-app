import DisplayReviews from "@/components/DisplayReviews";
import pastReviews from "@/dummy_data/pastReviewsData";
import { View } from "react-native";


const PastReviews = ()=>{
    //getting the dummy data
    const data = pastReviews;
    return(
        <View>
            <DisplayReviews reviews={data}/>
        </View>
    )
}
export default PastReviews;