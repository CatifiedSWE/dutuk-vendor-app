import getReqs from "@/hooks/companyRequests/getRequests";
import getUser from "@/hooks/getUser";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text
} from "react-native";

const RequestMenu = () => {
  const [requests, setRequests] = useState<{ event: any; payment: any ,id:any}[]>();
  const [loading, setLoading] = useState(true);

  const displayCount = async () => {
    try {
      const user = await getUser();
      const id = user?.id.toString();
      if (id) {
        const req = await getReqs(id);
        if (req) {
          setRequests(req);
        }
      }
    } catch (err) {
      console.error("Error loading requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
      useCallback(()=>{
        displayCount();
      },[])
    )


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Request Menu</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : requests?.length ? (
        requests.map((req, key) => (
          <Pressable key={key} style={styles.card} onPress={()=>{router.push({pathname:"/requests/seperateRequest",params:{
            data:req.id
          }})}}>
            <Text style={styles.cardLabel}>Event:</Text>
            <Text style={styles.cardValue}>{req.event}</Text>
            <Text style={styles.cardLabel}>Payment:</Text>
            <Text style={styles.cardValue}>{req.payment}</Text>
          </Pressable>
        ))
      ) : (
        <Text style={styles.noDataText}>No requests found.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop:30,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#f9f9f9",
    minHeight: "100%",
  },
  heading: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  separateBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  separateBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
    marginBottom: 8,
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 40,
  },
});

export default RequestMenu;
