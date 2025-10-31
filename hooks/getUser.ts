import { supabase } from "@/utils/supabase";

const getUser = async() => {
    try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('User fetch timeout')), 3000)
        );
        
        const userPromise = supabase.auth.getUser();
        
        const { data: { user }, error: authError } = await Promise.race([
            userPromise, 
            timeoutPromise
        ]) as any;
    
        if (authError) {
            console.error("Authentication error:", authError);
            return null;
        }
    
        return user;
    } catch (error) {
        console.error("Error getting user:", error);
        return null;
    }        
}
export default getUser;