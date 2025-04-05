import { router, Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import { icons } from "../../constants";
import { StatusBar } from "expo-status-bar";
import { useGlobalContext } from "@/context/globalprovider";
import useAppwrite from "@/lib/useAppwrite";
import { getUserPosts } from "@/lib/appwrite";
import { useEffect } from "react";


const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Image
        source={icon}
        resizeMode="contain"
        style={{ tintColor: color, width: 24, height: 24 }}
      />
      <Text
        style={{
          color,
          fontFamily: focused ? "Poppins-SemiBold" : "Poppins-Regular",
          fontSize: 12,
          textAlign: "center",  // Ensures text is centered
          width: 50,  // Ensures text stays in one row
          marginTop: 2,  // Space between icon and text
        }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabLayout = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();

  const { data: posts = [] } = useAppwrite(() => getUserPosts(user?.$id)); 

useEffect(() => {
    if (!user) {
      console.log("User is null, redirecting to sign-in...");
      router.replace('/(auth)/sign-in');  
    }
  }, [user]);

  return (
    <>
      <StatusBar backgroundColor="#4169E1" style="light" />

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#0000FF", 
          tabBarInactiveTintColor: "#9d9dc2",
          tabBarShowLabel: false,
          tabBarStyle: {
            flexDirection: "row",
            justifyContent: "space-around",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "white",
            paddingVertical: 10,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={icons.home} color={color} name="Home" focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="searchbar"
          options={{
            title: "Search",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={icons.search} color={color} name="Search" focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={icons.profile} color={color} name="Profile" focused={focused} />
            ),
          }}
        />
        {/* <Tabs.Screen
          name="user"
          options={{
            title: "user",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={icons.profile} color={color} name="Profile" focused={focused} />
            ),
          }}
        /> */}
      </Tabs>
    </>
  );
};

export default TabLayout;
