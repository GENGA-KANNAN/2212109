import React, { useState} from "react";
import {Card,CardContent,Typography,Grid,TextField,Button,Box,Alert} from "@mui/material";
import {gen,validate} from "../utils/shortcode";
import {exists,save} from "../utils/storage";
import {logAction} from "../middleware/logger";
import { useNavigate} from "react-router-dom";

const DEFAULT_VALIDITY = 30;
function isValidUrl(value) {
  try {
    const u=new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ShortenerPage() {
  const [rows,setRows]=useState([{longUrl:"",validity:"",shortcode:"" }]);
  const [errors,setErrors]=useState({});
  const [globalError,setGlobalError]=useState("");
  const navigate = useNavigate();
  const updateRow = (i, field, value) => {
    const r = [...rows]; r[i][field] = value; setRows(r);
  };
  const addRow = () => { if (rows.length < 5) setRows([...rows, { longUrl: "", validity: "", shortcode: "" }]); };
  const removeRow = (i) => { const r = rows.slice(); r.splice(i, 1); setRows(r); };
  const validateAll = () => {
    const e = {};
    rows.forEach((row, idx) => {
      if (!row.longUrl || !isValidUrl(row.longUrl)) {
        e[idx] = { ...(e[idx] || {}), longUrl: "Enter full URL (http:// or https://)" };
      }
      if (row.validity) {
        const n = Number(row.validity);
        if (!Number.isInteger(n) || n <= 0) {
          e[idx] = { ...(e[idx] || {}), validity: "Validity must be a positive integer (minutes)" };
        }
      }
      if (row.shortcode) {
        const v = validate(row.shortcode.trim());
        if (!v.ok) e[idx] = { ...(e[idx] || {}), shortcode: v.msg };
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    setGlobalError("");
    if (!validateAll()) {setGlobalError("Fix validation errors"); return; }
    const now=new Date();
    const createdCodes=[];
    for (const row of rows) {
      let code=row.shortcode ? row.shortcode.trim() : "";
      if (code){
        if(exists(code)) {
          setGlobalError(`Shortcode "${code}" already exists`);
          logAction("ERROR_SHORTCODE_COLLISION", { code, longUrl: row.longUrl });
          return;
        }
      } else {
        let attempts = 0;
        do {
          code = gen(6);
          attempts++;
          if (attempts > 8) code = gen(8);
        } while (exists(code));
      }
      const validity=row.validity ? Number(row.validity) : DEFAULT_VALIDITY;
      const createdAt=now.toISOString();
      const expiresAt=new Date(now.getTime()+validity*60*1000).toISOString();
      const rec = {
        code,
        longUrl: row.longUrl,
        createdAt,
        expiresAt,
        validityMins: validity,
        clicks: [],
        custom: !!row.shortcode
      };

      save(rec);
      logAction("CREATE_SHORT_URL",{ code, longUrl: rec.longUrl, validityMins: validity });
      createdCodes.push(code);
    }
    navigate("/statistics", { state: { highlight: createdCodes } });
  };
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" gutterBottom>URL Shortener</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          You may shorten up to 5 URLs at once. Default validity: {DEFAULT_VALIDITY} minutes.
        </Typography>
        {globalError && <Box sx={{ mb: 2 }}><Alert severity="error">{globalError}</Alert></Box>}
        <form onSubmit={onSubmit}>
          <Grid container spacing={2}>
            {rows.map((r, idx) => (
              <Grid item xs={12} key={idx}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Original Long URL" fullWidth required value={r.longUrl}
                      onChange={(e) => updateRow(idx, "longUrl", e.target.value)}
                      error={!!errors[idx]?.longUrl} helperText={errors[idx]?.longUrl || ""} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField label="Validity (mins)" fullWidth value={r.validity}
                      onChange={(e) => updateRow(idx, "validity", e.target.value)}
                      error={!!errors[idx]?.validity} helperText={errors[idx]?.validity || `Default ${DEFAULT_VALIDITY}`} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField label="Custom shortcode (optional)" fullWidth value={r.shortcode}
                      onChange={(e) => updateRow(idx, "shortcode", e.target.value)}
                      error={!!errors[idx]?.shortcode} helperText={errors[idx]?.shortcode || "Alphanumeric, 3-20 chars"} />
                  </Grid>
                  <Grid item xs={12} sx={{textAlign:"right" }}>
                    {rows.length > 1 && <Button color="error" onClick={() => removeRow(idx)}>Remove</Button>}
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 2,display:"flex",gap:1}}>
            <Button variant="contained" type="submit">Shorten</Button>
            <Button variant="outlined" onClick={()=>setRows(rows.length < 5 ? [...rows, { longUrl: "", validity: "", shortcode: "" }] : rows)} disabled={rows.length >= 5}>Add Another</Button>
            <Button onClick={() => window.location.href = "/statistics"}>View Statistics</Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}
