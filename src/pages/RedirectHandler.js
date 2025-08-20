import React, {useEffect} from "react";
import {useParams,useNavigate} from "react-router-dom";
import {find,save} from "../utils/storage";
import {logAction} from "../middleware/logger";
import {Box,Typography,Button} from "@mui/material";

export default function RedirectHandler(){
  const {code}=useParams();
  const navigate=useNavigate();
  useEffect(()=>{
    const r=find(code);
    if(!r){
      logAction("ERROR",{type:"NOT_FOUND",code});
      setTimeout(()=>navigate("/"),1500);
      return;
    }
    if(new Date(r.expiresAt)<new Date()) {
      logAction("ERROR",{type:"EXPIRED",code });
      setTimeout(()=>navigate("/statistics"), 1500);
      return;
    }
    const click={timestamp:new Date().toISOString(),referrer:document.referrer || "direct"};
    r.clicks=r.clicks || []; r.clicks.push(click);
    save(r);
    logAction("REDIRECT",{code,click });
    window.location.href = r.longUrl;
  }, [code,navigate]);
  return (
    <Box>
      <Typography>Redirecting...</Typography>
      <Button onClick={() => navigate("/")}>Back Home</Button>
    </Box>
  );
}
