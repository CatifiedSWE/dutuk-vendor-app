import { supabase } from "@/utils/supabase";

type companyRequestProp = {
    customerId:string,
    companyName:string,
    date:string[],
    eventName:string,
    eventDescription:string,
    payment:number
}
const acceptCustomerRequest = async(data:companyRequestProp)=>{
    const {error:err} = await supabase.from("events").insert([
        {
            customer_id:data.customerId,
            company_name:data.companyName,
            date:data.date,
            event:data.eventName,
            description:data.eventDescription,
            payment:data.payment
        }
    ])
    if(err){
        console.error("Error Accepting Offer: ",err);
        return false;
    }
    else{
        console.log("Successfully Accepted offer");
        return true;
    }
}
export default acceptCustomerRequest;