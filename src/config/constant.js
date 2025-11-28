const isLive=Number(process.env.NEXT_PUBLIC_IS_LIVE);

const constant={
    Agora_App_id:process.env.NEXT_PUBLIC_AGORA_APP_ID,
    Server_Url: isLive ? process.env.NEXT_PUBLIC_SERVER_DEV_URL : process.env.NEXT_PUBLIC_SERVER_LOCAL_URL,
}

export default constant;