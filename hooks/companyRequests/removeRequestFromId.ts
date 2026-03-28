import logger from '@/utils/logger';
import { supabase } from "@/utils/supabase";

const removeRequest = async(id:number)=>{
    const {error:err} = await supabase.from("requests").delete().eq("id",id);
    if(err){
        logger.log(err);
        return false;
    }
    else{
        return true;
    }
}
export default removeRequest;