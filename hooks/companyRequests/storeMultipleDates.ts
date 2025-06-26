import { supabase } from "@/utils/supabase";
import getUser from "../getUser";

const storeMultipleDates = async(dates:string[],event:string,description:string)=>{
    let data = await getUser();
    let id = data?.id;
    dates.forEach(async(date)=>{
        const { error: insertError } = await supabase.from("dates").insert([
                {
                  user_id: id,
                  date,
                  event,
                  description
                },
              ]);
              if (insertError) {
                console.error("Error inserting Date:"+date+"\n"+ insertError);
                return false;
              } else {
                console.log("Date inserted."+date);
              }
    })
    return true;
}
export default storeMultipleDates;