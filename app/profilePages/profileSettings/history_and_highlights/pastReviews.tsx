import DisplayReviews from "@/components/DisplayReviews";
import { useVendorStore } from "@/store/useVendorStore";
import { useEffect } from "react";
import { Text, View } from "react-native";

const PastReviews = () => {
    const data = useVendorStore((state) => state.reviews);
    const fetchReviews = useVendorStore((state) => state.fetchReviews);

    useEffect(() => {
        fetchReviews();
    }, []);

    if (data && data.length > 0) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <DisplayReviews reviews={data} />
            </View>
        )
    }
    else {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading</Text>
            </View>
        )
    }
}
export default PastReviews;