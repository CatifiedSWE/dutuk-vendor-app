import currentEvents from "@/dummy_data/currentEvents";
import { Ionicons } from '@expo/vector-icons';

import { FlatList, StyleSheet, Text, View } from "react-native";

const CurrentEvents = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={currentEvents}
        keyExtractor={(item) => item.id}
        renderItem={({item} ) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}><Ionicons name="calendar-outline" size={20} color="black" /> {item.from} → {item.to}</Text>
            <Text style={styles.text}><Ionicons name="cash-outline" size={20} color="black" />  Total Cost: ₹{item.cost}</Text>
            <Text style={styles.text}>🟢 Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA", padding: 16 },
  heading: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  card: {
    backgroundColor: "#ffffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  title: { fontSize: 18, fontWeight: "600" },
  text: { marginTop: 4, color: "#333" },
});

export default CurrentEvents;
