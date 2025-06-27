import NavBar from "@/components/NavBar";
import RouteAssist from "@/components/RouteAssist";
import getCount from "@/hooks/companyRequests/getRequestsCount";
import getUser from "@/hooks/getUser";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Button,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const Home = () => {
  const [requests, setRequests] = useState<number | null>(null);

  const displayCount = async () => {
    const user = await getUser();
    let id = user?.id.toString();
    let count;
    if (typeof id === "string") count = await getCount(id);
    if (typeof count === "number") setRequests(count);
  };

    useFocusEffect(
        useCallback(()=>{
          displayCount();
        },[])
      )


  return (
    <SafeAreaView style={styles.container}>
      <NavBar />

      <View style={styles.content}>
        <Text style={styles.heading}>Home</Text>

        <Button
          title="Go to Calendar"
          color="#0077cc"
          onPress={() => router.push("/profile/calender/CalendarPage")}
        />

        <View style={styles.buttonSpacing}>
          <RouteAssist text="Events" path="/event" />
        </View>

        <Pressable style={styles.requestsBox} onPress={()=>router.push("/requests/menu")}>
          <Text style={styles.requestsText}>{requests?requests:"0"} Requests</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 20,
  },
  heading: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20,
  },
  buttonSpacing: {
    width: "80%",
  },
  requestsBox: {
    marginTop: 20,
    backgroundColor: "#e3f2fd",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
  },
  requestsText: {
    fontSize: 18,
    color: "#1e88e5",
    fontWeight: "600",
  },
});

export default Home;
