import customStyle from "@/assets/customStyle";
import acceptCustomerRequest from "@/hooks/companyRequests/acceptCustomerOffer";
import getReqMini from "@/hooks/companyRequests/getRequestFromId";
import removeRequest from "@/hooks/companyRequests/removeRequestFromId";
import storeMultipleDates from "@/hooks/companyRequests/storeMultipleDates";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

const SeperateRequest = () => {
  type MarkedDateType = {
    [date: string]: {
      dots?: { key: string; color: string }[];
      periods?: {
        startingDay?: boolean;
        endingDay?: boolean;
        color: string;
      }[];
      customStyles?: {
        container?: {
          borderRadius?: number;
          borderWidth?: number;
          borderColor?: string;
          backgroundColor?: string;
        };
        text?: {
          color?: string;
        };
      };
    };
  };

  const [req, setReq] = useState<{
    customer_id:string,
    company_name:string,
    event: string;
    payment: string;
    date: string[];
    description: string;
  }>();
  const [loading, setLoading] = useState(true);
  const { data } = useLocalSearchParams();

  const [marked, setMarked] = useState<string[]>([]);
  const markedDates: MarkedDateType = marked.reduce((acc, date) => {
    acc[date] = { ...customStyle };
    return acc;
  }, {} as MarkedDateType);

  const getRequest = async () => {
    if (typeof data === "string") {
      const d = await getReqMini(data);
      setReq(d);
      setMarked(d.date);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(()=>{
      getRequest();
    },[])
  )

  const handleDeclineReq = async()=>{
    const result = await removeRequest(Number(data));
    if(result){
        Alert.alert("Succesully declined Offer");
        router.replace("/requests/menu");
    }
    else{
        Alert.alert("Error declining the request");
    }
  }
  const handleAcceptReq =async()=>{
    if(typeof req?.event==='string'){
    const result = await storeMultipleDates(marked,req?.event,req?.description);
    
    
    if(result){
      Alert.alert("Request Successfully accepted");
      await removeRequest(Number(data));
      router.back();
    }
    else{
      Alert.alert("Error Accepting Request,Please try again later");
    }
     let d = {customerId:req?.customer_id,companyName:req?.company_name,date:req?.date,eventName:req?.event,eventDescription:req?.description,payment:Number(req?.payment)};
    const result2 = await acceptCustomerRequest(d);
  }
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Request Details</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 30 }} />
      ) : req ? (
        <View style={styles.card}>
          <Text style={styles.label}>Event Name</Text>
          <Text style={styles.value}>{req.event}</Text>

          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{req.description}</Text>

          <Text style={styles.label}>Scheduled Dates</Text>
          <Calendar
            markingType="custom"
            markedDates={markedDates}
            style={styles.calendar}
          />

          <Text style={styles.label}>Payment</Text>
          <Text style={styles.value}>₹ {req.payment}</Text>

          <View style={styles.buttonContainer}>
            <Pressable style={styles.acceptButton} onPress={handleAcceptReq}>
              <Text style={styles.buttonText}>Accept</Text>
            </Pressable>
            <Pressable style={styles.declineButton} onPress={handleDeclineReq}>
              <Text style={styles.buttonText}>Decline</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Text style={styles.errorText}>No request found.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop:30,
    padding: 20,
    backgroundColor: "#f2f4f7",
    minHeight: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e1e1e",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    color: "#555",
  },
  value: {
    fontSize: 16,
    marginTop: 4,
    color: "#222",
    lineHeight: 22,
  },
  calendar: {
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  acceptButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: "#28C76F",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  declineButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#EA5455",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
});

export default SeperateRequest;
