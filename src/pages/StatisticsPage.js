import React, { useEffect, useState } from "react";
import {
  Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Button, Chip, Collapse, Box
} from "@mui/material";
import { readAll, find, save } from "../utils/storage";
import { logAction } from "../middleware/logger";
import { useLocation } from "react-router-dom";
function isExpired(r) { return new Date() > new Date(r.expiresAt); }
export default function StatisticsPage() {
  const [list, setList] = useState([]);
  const [openMap, setOpenMap] = useState({});
  const location = useLocation();
  useEffect(() => {
    setList(readAll().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, [location]);
  const openShort = (code) => {
    const r = find(code);
    if (!r) { alert("Short link not found."); logAction("ERROR", { type: "NOT_FOUND", code }); return; }
    if (isExpired(r)) { alert(`Short link expired at ${new Date(r.expiresAt).toLocaleString()}`); logAction("ERROR", { type: "EXPIRED", code }); return; }
    const click = { timestamp: new Date().toISOString(), referrer: document.referrer || "direct" };
    r.clicks = r.clicks || []; r.clicks.push(click);
    save(r);
    logAction("REDIRECT", { code, click });
    // real redirect
    window.location.href = r.longUrl;
  };
  const toggle = (code) => setOpenMap((m) => ({ ...m, [code]: !m[code] }));
  const highlights = location.state?.highlight || [];
  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Statistics</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>Click details show timestamp and referrer.</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Shortcode</TableCell>
              <TableCell>Original URL</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Expires At</TableCell>
              <TableCell>Clicks</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((r) => (
              <React.Fragment key={r.code}>
                <TableRow selected={highlights.includes(r.code)}>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Chip label={r.code} size="small" />
                      {r.custom && <Chip label="custom" size="small" variant="outlined" />}
                      {isExpired(r) && <Chip label="expired" size="small" color="error" />}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>
                    <a href={r.longUrl} target="_blank" rel="noreferrer">{r.longUrl}</a>
                  </TableCell>
                  <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{new Date(r.expiresAt).toLocaleString()}</TableCell>
                  <TableCell>{(r.clicks || []).length}</TableCell>
                  <TableCell>
                    <Button variant="contained" size="small" onClick={() => openShort(r.code)}>Open</Button>
                    <Button size="small" onClick={() => toggle(r.code)} sx={{ ml: 1 }}>{openMap[r.code] ? "Hide" : "View"}</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={6} style={{padding:0}}>
                    <Collapse in={openMap[r.code]} timeout="auto" unmountOnExit>
                      <Box sx={{p:1}}>
                        <Typography variant="subtitle2">Click details</Typography>
                        {(!r.clicks || r.clicks.length === 0) ? (
                          <Typography variant="body2">No clicks yet.</Typography>
                        ) : (
                          <Table size="small">
                            <TableHead>
                              <TableRow><TableCell>Timestamp</TableCell><TableCell>Referrer</TableCell></TableRow>
                            </TableHead>
                            <TableBody>
                              {r.clicks.slice().reverse().map((c, i) => (
                                <TableRow key={i}>
                                  <TableCell>{new Date(c.timestamp).toLocaleString()}</TableCell>
                                  <TableCell>{c.referrer}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
