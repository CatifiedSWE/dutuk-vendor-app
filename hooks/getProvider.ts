import logger from '@/utils/logger';
import getUser from "./getUser";

const getProvider =async()=>{
    try{
        const user = await getUser();
        if(!user) logger.error("Cannot get User");
        else{
        const provider = user?.app_metadata.provider
        if(!provider) logger.error("Cannot get Provider");
        else{
        logger.log("Provider:"+provider)
        return provider}}
        }
        catch(e){
            logger.error(e);
        }
    }
    export default getProvider;