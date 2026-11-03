// src/components/MisGrados.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card, CardHeader, CardContent, Stack, TextField, InputAdornment,
  IconButton, Tooltip, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, Alert, Button, Skeleton, Chip, Box, Divider
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { apiFetch } from "../api";
import VerAlumnosModal from "./VerAlumnosModal.jsx";

export default function MisGrados({ maestroId = null, titulo = "Mis grados" }) {
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openVer, setOpenVer] = useState(false);
  const [gradoSel, setGradoSel] = useState(null);
  const [q, setQ] = useState("");
  const abortRef = useRef(null);

  // Endpoints posibles
  const endpointById    = useMemo(() => maestroId ? `/api/maestros/${maestroId}/grados` : null, [maestroId]);
  const endpointByToken = "/api/maestros/mis-grados";

  const fetchGrados = async () => {
    setLoading(true);
    setError(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let data;

      if (endpointById) {
        try {
          data = await apiFetch(endpointById, { signal: controller.signal });
        } catch (e) {
          const status = e?.status ?? e?.response?.status;
          if (status === 404) {
            // La ruta por ID no existe: fallback al endpoint por token
            data = await apiFetch(endpointByToken, { signal: controller.signal });
          } else {
            throw e;
          }
        }
      } else {
        data = await apiFetch(endpointByToken, { signal: controller.signal });
      }

      setGrados(Array.isArray(data) ? data : []);
      // console.log("MisGrados → fuente:", endpointById ? "porId (o fallback)" : "porToken", "total:", Array.isArray(data) ? data.length : 0);
    } catch (e) {
      if (e.name !== "AbortError") setError(e?.message || "Error al cargar grados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrados();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpointById]); // cambia cuando cambia maestroId

  const abrirVer = (g) => { setGradoSel(g); setOpenVer(true); };

  const gradosFiltrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return grados;
    return grados.filter(g =>
      `${g.grado ?? ""}`.toLowerCase().includes(term) ||
      `${g.seccion ?? ""}`.toLowerCase().includes(term)
    );
  }, [q, grados]);

  const EmptyState = (
    <Box sx={{ textAlign: "center", py: 6, px: 2, color: "text.secondary" }}>
      <SchoolIcon sx={{ fontSize: 48, opacity: 0.6 }} />
      <Box sx={{ mt: 1, fontWeight: 600 }}>Sin asignaciones aún</Box>
      <Box sx={{ fontSize: 14 }}>
        {grados.length === 0 ? "No tienes grados asociados." : "No hay coincidencias con el filtro."}
      </Box>
      <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={fetchGrados} startIcon={<RefreshIcon />}>
        Recargar
      </Button>
    </Box>
  );

  return (
    <>
      <Card elevation={2} sx={{ mt: 3, borderRadius: 3, overflow: "hidden", ".MuiCardHeader-root": { pb: 0.5 } }}>
        <CardHeader
          avatar={
            <Box sx={{ width: 42, height: 42, borderRadius: "12px", display: "grid", placeItems: "center", bgcolor: "#8C2D2A" }}>
              <SchoolIcon sx={{ color: "#fff" }} />
            </Box>
          }
          title={titulo}
          subheader="Consulta tus secciones y accede rápidamente a tus alumnos"
          sx={{
            "& .MuiCardHeader-title": { fontWeight: 700, fontSize: 20 },
            "& .MuiCardHeader-subheader": { color: "text.secondary" },
          }}
          action={
            <Stack direction="row" spacing={1} alignItems="center" sx={{ pr: 2, pb: 1 }}>
              <TextField
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por grado o sección…"
                size="small"
                sx={{ minWidth: 280, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Tooltip title="Recargar">
                <span>
                  <IconButton onClick={fetchGrados} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          }
        />

        <CardContent sx={{ pt: 1.5 }}>
          {error && (
            <Alert
              icon={<ErrorOutlineIcon fontSize="inherit" />}
              severity="error"
              sx={{ mb: 2, borderRadius: 2 }}
              action={<Button color="inherit" size="small" onClick={fetchGrados}>Reintentar</Button>}
            >
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ px: 1 }}>
              <Skeleton variant="rounded" height={52} sx={{ mb: 1.5, borderRadius: 2 }} />
              <Skeleton variant="rounded" height={52} sx={{ mb: 1.5, borderRadius: 2 }} />
              <Skeleton variant="rounded" height={52} sx={{ mb: 1.5, borderRadius: 2 }} />
            </Box>
          ) : (
            <>
              <Divider sx={{ mb: 2 }} />
              {gradosFiltrados.length === 0 ? (
                EmptyState
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Grado</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Sección</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 220 }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gradosFiltrados.map((g) => (
                        <TableRow hover key={g.id_grado ?? `${g.grado}-${g.seccion}`}>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={g.grado ?? "—"}
                                size="small"
                                sx={{ bgcolor: "#D4AF37", color: "#000", fontWeight: 600 }}
                              />
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ color: "text.primary" }}>
                            {g.seccion ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1.2}>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<GroupIcon />}
                                onClick={() => abrirVer(g)}
                                sx={{
                                  textTransform: "none",
                                  borderRadius: 2,
                                  bgcolor: "#8C2D2A",
                                  "&:hover": { bgcolor: "#7b2725" },
                                }}
                              >
                                Ver alumnos
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <VerAlumnosModal open={openVer} onClose={() => setOpenVer(false)} grado={gradoSel} />
    </>
  );
}
