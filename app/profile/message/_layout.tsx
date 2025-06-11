import { Stack } from "expo-router";

const Layout = ()=>{
    return(
        <Stack screenOptions={{headerShown:false}}>
            <Stack.Screen name="index" options={{title:"Chat Menu"}} />
        </Stack>
    )
}
export default Layout;