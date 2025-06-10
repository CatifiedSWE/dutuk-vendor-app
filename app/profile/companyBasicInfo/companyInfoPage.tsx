import React from "react";
import { TextInput, View } from "react-native";

const companyInfoPage = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput placeholder="Company name" editable={false} />
      <TextInput placeholder="Mail" editable={false} />
      <TextInput placeholder="Address" editable={false} />
      <TextInput placeholder="Phone number" editable={false} />
      <TextInput placeholder="Website" editable={false} />
    </View>
  );
};

export default companyInfoPage;
