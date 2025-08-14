"use client";

import { useState, useEffect } from "react";
import { FaTrash, FaFileExcel, FaSync } from "react-icons/fa";
import { getAdvertisers, getSuppliers } from "@/app/api/filtersService/filtersService";
import { getReportRotador } from "@/app/api/report/service";
import * as XLSX from "xlsx";
import { Box, Button, Select, MenuItem, Input, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, useTheme } from "@mui/material";
import ClickAwayListener from '@mui/material/ClickAwayListener';
interface RotadorInterface {
  Campaign: string;
  CreationDate: string;
  Advertiser: string;
  Supplier: string;
  SubPubID: string;
  Rotador: string;
  count: number;
  OfferID: number;
}

interface Advertiser {
  AdvertiserID: number;
  Advertiser: string;
}

interface Supplier {
  SupplierID: number;
  Supplier: string;
}

const ShowRotador: React.FC = () => {
  const theme = useTheme();
  const today = new Date().toISOString().split("T")[0];

  const [listAdvertisers, setListAdvertisers] = useState<Advertiser[]>([]);
  const [listPublishers, setListPublishers] = useState<Supplier[]>([]);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [reportInfo, setReportInfo] = useState<RotadorInterface[]>([]);
  const [isLoading, setIsLoading] = useState(false);
const [showAdvertiserSuggestions, setShowAdvertiserSuggestions] = useState(false);
const [showPublisherSuggestions, setShowPublisherSuggestions] = useState(false);
  const fetchData = async () => {
    try {
      const [advertisersResponse, suppliersResponse] = await Promise.all([
        getAdvertisers(),
        getSuppliers(),
      ]);

      setListAdvertisers(
        advertisersResponse.result.sort((a: Advertiser, b: Advertiser) =>
          a.Advertiser.localeCompare(b.Advertiser)
        )
      );
      setListPublishers(
        suppliersResponse.result.sort((a: Supplier, b: Supplier) =>
          a.Supplier.localeCompare(b.Supplier)
        )
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await getReportRotador(
        dateFrom,
        dateTo,
        selectedAdvertiser ? Number(selectedAdvertiser) : 0,
        selectedPublisher ? Number(selectedPublisher) : 0
      );
      setReportInfo(response.result || []);
    } catch (error) {
      console.error("Error fetching report:", error);
      alert("Error al cargar el reporte. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    try {
      if (reportInfo.length === 0) {
        alert("No hay datos para exportar");
        return;
      }
      const worksheet = XLSX.utils.json_to_sheet(reportInfo);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "RotadorReport");
      const fileName = `RotadorReport_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Hubo un error al exportar el archivo");
    }
  };

  const handleClear = (field: string) => {
    switch (field) {
      case "advertiser":
        setSelectedAdvertiser("");
        break;
      case "publisher":
        setSelectedPublisher("");
        break;
      case "dateFrom":
        setDateFrom(today);
        break;
      case "dateTo":
        setDateTo(today);
        break;
      default:
        break;
    }
  };

  const showButtons = selectedAdvertiser || selectedPublisher || dateFrom !== today || dateTo !== today || reportInfo.length > 0;

  return (
    <Box sx={{ p: 3, bgcolor: "background.default", borderRadius: 2, boxShadow: 1, color: theme.palette.text.primary }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: theme.palette.text.primary }}>
          Rotador Report
        </h1>
      </Box>

      {/* Filtros */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" },
          gap: 2,
          bgcolor: "background.paper",
          p: 2,
          borderRadius: 1,
          color: theme.palette.text.primary,
        }}
      >
      <ClickAwayListener onClickAway={() => setShowAdvertiserSuggestions(false)}>
  <Box sx={{ position: "relative" }}>
    <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '8px' }}>
      Advertiser
    </label>
    <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
      <Input
        fullWidth
        placeholder="Search advertisers..."
        value={
          listAdvertisers.find((a) => a.AdvertiserID.toString() === selectedAdvertiser)?.Advertiser || selectedAdvertiser
        }
        onChange={(e) => setSelectedAdvertiser(e.target.value)}
        onFocus={() => setShowAdvertiserSuggestions(true)}
        sx={{ height: 48 }}
      />
      {selectedAdvertiser && (
        <Button
          onClick={() => handleClear("advertiser")}
          sx={{
            minWidth: 40,
            height: 40,
            ml: 1,
            bgcolor: theme.palette.grey[300],
            color: theme.palette.text.primary,
            "&:hover": { bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText },
          }}
        >
          <FaTrash />
        </Button>
      )}
      {showAdvertiserSuggestions && (
        <Box
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 10,
            width: "100%",
            bgcolor: "background.paper",
            boxShadow: 3,
            borderRadius: 1,
            mt: 1,
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {listAdvertisers
            .filter((a) =>
              a.Advertiser.toLowerCase().includes(selectedAdvertiser.toLowerCase())
            )
            .map((a) => (
              <Box
                key={a.AdvertiserID}
                onClick={() => {
                  setSelectedAdvertiser(a.AdvertiserID.toString());
                  setShowAdvertiserSuggestions(false);
                }}
                sx={{
                  px: 2,
                  py: 1,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                {a.Advertiser}
              </Box>
            ))}
        </Box>
      )}
    </Box>
  </Box>
</ClickAwayListener>


        <ClickAwayListener onClickAway={() => setShowPublisherSuggestions(false)}>
  <Box sx={{ position: "relative" }}>
    <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '8px' }}>
      Publisher
    </label>
    <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
      <Input
        fullWidth
        placeholder="Search publishers..."
        value={
          listPublishers.find((p) => p.SupplierID.toString() === selectedPublisher)?.Supplier || selectedPublisher
        }
        onChange={(e) => setSelectedPublisher(e.target.value)}
        onFocus={() => setShowPublisherSuggestions(true)}
        sx={{ height: 48 }}
      />
      {selectedPublisher && (
        <Button
          onClick={() => handleClear("publisher")}
          sx={{
            minWidth: 40,
            height: 40,
            ml: 1,
            bgcolor: theme.palette.grey[300],
            color: theme.palette.text.primary,
            "&:hover": { bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText },
          }}
        >
          <FaTrash />
        </Button>
      )}
      {showPublisherSuggestions && (
        <Box
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 10,
            width: "100%",
            bgcolor: "background.paper",
            boxShadow: 3,
            borderRadius: 1,
            mt: 1,
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {listPublishers
            .filter((p) =>
              p.Supplier.toLowerCase().includes(selectedPublisher.toLowerCase())
            )
            .map((p) => (
              <Box
                key={p.SupplierID}
                onClick={() => {
                  setSelectedPublisher(p.SupplierID.toString());
                  setShowPublisherSuggestions(false);
                }}
                sx={{
                  px: 2,
                  py: 1,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                {p.Supplier}
              </Box>
            ))}
        </Box>
      )}
    </Box>
  </Box>
</ClickAwayListener>

        <Box sx={{ position: "relative" }}>
          <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '8px' }}>
            From
          </label>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Input
              type="date"
              fullWidth
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              sx={{ height: 48 }}
            />
            {dateFrom !== today && (
              <Button
                onClick={() => handleClear("dateFrom")}
                sx={{
                  minWidth: 40,
                  height: 40,
                  ml: 1,
                  bgcolor: theme.palette.grey[300],
                  color: theme.palette.text.primary,
                  "&:hover": { bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText },
                }}
              >
                <FaTrash />
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ position: "relative" }}>
          <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '8px' }}>
            To
          </label>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Input
              type="date"
              fullWidth
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              sx={{ height: 48 }}
            />
            {dateTo !== today && (
              <Button
                onClick={() => handleClear("dateTo")}
                sx={{
                  minWidth: 40,
                  height: 40,
                  ml: 1,
                  bgcolor: theme.palette.grey[300],
                  color: theme.palette.text.primary,
                  "&:hover": { bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText },
                }}
              >
                <FaTrash />
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Botones */}
      {showButtons && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2, flexWrap: "wrap" }}>
          <Button
            onClick={handleRefresh}
            variant="outlined"
            color="inherit"
            size="medium"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <FaSync />}
            sx={{
              minWidth: { xs: "100%", sm: 100 },
              height: 40,
              fontSize: "1rem",
            }}
          >
            Refresh
          </Button>
          <Button
            onClick={handleExportExcel}
            variant="contained"
            color="inherit"
            size="medium"
            startIcon={<FaFileExcel />}
            sx={{
              minWidth: { xs: "100%", sm: 100 },
              height: 40,
              fontSize: "1rem",
            }}
          >
            Excel
          </Button>
        </Box>
      )}

      {/* Tabla de Resultados */}
      <Box sx={{ mt: 3, overflowX: "auto", pb: 2 }}>
        <Table sx={{ minWidth: 650, bgcolor: "background.paper", borderRadius: 1, "& .MuiTableCell-root": { borderBottom: `1px solid ${theme.palette.divider}`, padding: "12px" }, color: theme.palette.text.primary }}>
          <TableHead>
            <TableRow>
              <TableCell>Campaign</TableCell>
              <TableCell>Creation Date</TableCell>
              <TableCell>Advertiser</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>SubPubID</TableCell>
              <TableCell>Rotador</TableCell>
              <TableCell>Count</TableCell>
              <TableCell>OfferID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportInfo.length > 0 ? (
              reportInfo.map((item, index) => (
                <TableRow key={index} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title={item.Campaign}>
                    {item.Campaign}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title={item.CreationDate}>
                    {item.CreationDate}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title={item.Advertiser}>
                    {item.Advertiser}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title={item.Supplier}>
                    {item.Supplier}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title={item.SubPubID}>
                    {item.SubPubID}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title={item.Rotador}>
                    {item.Rotador}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title={String(item.count)}>
                    {item.count}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title={String(item.OfferID)}>
                    {item.OfferID}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: "center", py: 2, color: theme.palette.text.secondary }}>
                  No report entries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default ShowRotador;