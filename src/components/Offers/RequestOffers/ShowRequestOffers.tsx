"use client";
import { getSuppliersFromAPI, getRequestsBySupplier } from "@/app/api/filtersService/filtersService";
import React, { useEffect, useState } from "react";
import apiClient from "@/libs/axiosConfig";

import {
  Box,
  Button,
  Select,
  MenuItem,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme,
  Tooltip,
} from "@mui/material";
import { FaEye, FaEdit, FaCheck, FaTimes } from "react-icons/fa"; // Added icon imports
import { aceptRequestOffer, updateValuesRequestOffer } from "@/app/api/request-offer/service";

// Interfaces for type safety
interface Supplier {
  supplierID: number;
  supplier: string;
}

interface Campaign {
  URL?: string;
}

interface Request {
  OfferID: number;
  Offer: string;
  Supplier?: Supplier;
  Advertiser?: { Advertiser: string };
  Cost?: number;
  Proxy?: string;
  DailyCapClick?: number;
  DailyCap?: number;
  Campaign?: Campaign;
}

const ShowRequestOffers: React.FC = () => {
  const theme = useTheme();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [editRequest, setEditRequest] = useState<Request | null>(null);
  const [initialEditRequest, setInitialEditRequest] = useState<Request | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getSuppliersFromAPI();
        setSuppliers(data.result ? data.result : []);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        setSuppliers([]);
      }
    };
    fetchSuppliers();
  }, []);

  const fetchRequests = async (supplierID: number) => {
    setLoading(true);
    try {
      const data = await getRequestsBySupplier(supplierID);
      const requestsData = Array.isArray(data.result) ? data.result : [];
      setRequests(requestsData);
      return requestsData;
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequests([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateSuppliersList = (supplierID: number) => {
    setSuppliers((prevSuppliers) =>
      prevSuppliers.filter((supplier) => supplier.supplierID !== supplierID)
    );
    if (selectedSupplier === supplierID) {
      setSelectedSupplier(null);
      setRequests([]);
    }
  };

  const handleSupplierChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const supplierID = Number(event.target.value);
    setSelectedSupplier(supplierID);
    if (supplierID) {
      await fetchRequests(supplierID);
    } else {
      setRequests([]);
    }
  };

  const handleViewClick = (request: Request) => {
    setSelectedRequest(request);
  };

  const handleEditClick = (request: Request) => {
    const requestCopy = { ...request, Campaign: { ...request.Campaign } };
    setEditRequest(requestCopy);
    setInitialEditRequest(requestCopy);
  };

  const deleteOffer = async (offerID: number, supplierID: number) => {
    if (!selectedSupplier) return;
    setLoading(true);
    try {
      const response = await apiClient.delete(
        `https://api.laikad.com/api/pub/v2.0/offers?OfferID=${offerID}&SupplierID=${supplierID}`,
        {
          headers: {
            "Access-Token": localStorage.getItem("accessToken") || "",
          },
        }
      );
      const updatedRequests = await fetchRequests(supplierID);
      if (updatedRequests.length === 0) {
        updateSuppliersList(supplierID);
      }
    } catch (error) {
      console.error("Error deleting offer:", error);
    } finally {
      setLoading(false);
    }
  };

  const editOfferRequest = async () => {
    if (!editRequest) return;
    setLoading(true);
    try {
      const method = editRequest.OfferID ? "PUT" : "POST";
      const response = await updateValuesRequestOffer(method, editRequest);
      if (selectedSupplier) {
        await fetchRequests(selectedSupplier);
      }
      setEditRequest(null);
      setInitialEditRequest(null);
    } catch (error) {
      console.error("Error updating/adding offer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAceptClick = async (request: Request) => {
    if (!selectedSupplier) return;
    setLoading(true);
    try {
      const response = await aceptRequestOffer(request);
      const updatedRequests = await fetchRequests(selectedSupplier);
      
      if (updatedRequests.length === 0) {
        updateSuppliersList(selectedSupplier);
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditRequest((prev: Request | null) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: name === "Cost" || name === "DailyCapClick" || name === "DailyCap" ? (Number(value) || 0) : value,
        Campaign: name === "URL" ? { ...prev.Campaign, URL: value } : prev.Campaign,
      };
    });
  };

  const hasChanges = () => {
    if (!editRequest || !initialEditRequest) return false;
    return (
      editRequest.Offer !== initialEditRequest.Offer ||
      editRequest.Cost !== initialEditRequest.Cost ||
      editRequest.Proxy !== initialEditRequest.Proxy ||
      editRequest.DailyCapClick !== initialEditRequest.DailyCapClick ||
      editRequest.DailyCap !== initialEditRequest.DailyCap ||
      editRequest.Campaign?.URL !== initialEditRequest.Campaign?.URL
    );
  };

  return (
    <Box sx={{ p: 3, bgcolor: "background.default", borderRadius: 2, boxShadow: 1, color: theme.palette.text.primary }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: theme.palette.text.primary }}>
          Requested Offers
        </h1>
      </Box>

      <Box sx={{ mb: 4 }}>
      <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 1 }}>          Supplier
        </label>
        {suppliers.length > 0 ? (
          <Select
            fullWidth
            value={selectedSupplier ?? ""}
            onChange={handleSupplierChange as any} // Type assertion due to MUI Select event type mismatch
            sx={{
              height: 48,
              bgcolor: "background.paper",
              "& .MuiSelect-select": { color: theme.palette.text.primary },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.divider },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
            }}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select Supplier...
            </MenuItem>
            {suppliers.map((supplier) => (
              <MenuItem key={supplier.supplierID} value={supplier.supplierID}>
                {`${supplier.supplier} (${supplier.supplierID})`}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <Box sx={{ color: theme.palette.text.secondary, mb: 4 }}>
            No Request Offers available.
          </Box>
        )}
      </Box>

      {loading && !editRequest && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 4 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Box component="span" sx={{ color: theme.palette.text.secondary }}>
            Loading...
          </Box>
        </Box>
      )}

      {!loading && requests.length === 0 && selectedSupplier && (
        <Box sx={{ color: theme.palette.text.secondary, mb: 4 }}>
          No requests found for this supplier.
        </Box>
      )}

      {!loading && requests.length > 0 && (
        <Box sx={{ bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}>
          <Table sx={{ minWidth: 650, "& .MuiTableCell-root": { borderBottom: `1px solid ${theme.palette.divider}`, padding: "12px" }, color: theme.palette.text.primary }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Campaign ID</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request, index) => (
                <TableRow key={index} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                  <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }} title={request.Offer}>
                    {request.Offer}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title={request.OfferID.toString()}>
                    {request.OfferID}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="View Details">
                        <Button
                          onClick={() => handleViewClick(request)}
                          variant="contained"
                          size="small"
                          sx={{
                            minWidth: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: theme.palette.grey[300],
                            color: theme.palette.text.primary,
                            "&:hover": { bgcolor: theme.palette.info.main, color: theme.palette.info.contrastText },
                            p: 0.5,
                          }}
                        >
                          <FaEye />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Edit Request">
                        <Button
                          onClick={() => handleEditClick(request)}
                          variant="contained"
                          size="small"
                          sx={{
                            minWidth: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: theme.palette.grey[300],
                            color: theme.palette.text.primary,
                            "&:hover": { bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText },
                            p: 0.5,
                          }}
                        >
                          <FaEdit />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Accept Request">
                        <Button
                          onClick={() => handleAceptClick(request)}
                          variant="contained"
                          size="small"
                          sx={{
                            minWidth: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: theme.palette.grey[300],
                            color: theme.palette.text.primary,
                            "&:hover": { bgcolor: theme.palette.success.main, color: theme.palette.success.contrastText },
                            p: 0.5,
                          }}
                        >
                          <FaCheck />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Delete Request">
                        <Button
                          onClick={() => deleteOffer(request.OfferID, selectedSupplier!)}
                          variant="contained"
                          size="small"
                          sx={{
                            minWidth: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: theme.palette.grey[300],
                            color: theme.palette.text.primary,
                            "&:hover": { bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText },
                            p: 0.5,
                          }}
                        >
                          <FaTimes />
                        </Button>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {selectedRequest && (
        <Box sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: "background.paper", p: { xs: 3, sm: 4 }, borderRadius: 2, maxWidth: 400, boxShadow: 3, color: theme.palette.text.primary }}>
            <h3 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: theme.palette.text.primary }}>
              Offer Details
            </h3>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <label style={{ color: theme.palette.text.secondary, fontSize: "0.875rem" }}>Offer:</label>
                <Box sx={{ color: theme.palette.text.primary, fontSize: "0.875rem" }}>{selectedRequest.Offer || "N/A"}</Box>
              </Box>
              <Box>
                <label style={{ color: theme.palette.text.secondary, fontSize: "0.875rem" }}>Supplier:</label>
                <Box sx={{ color: theme.palette.text.primary, fontSize: "0.875rem" }}>{selectedRequest.Supplier?.supplier || "N/A"}</Box>
              </Box>
              <Box>
                <label style={{ color: theme.palette.text.secondary, fontSize: "0.875rem" }}>Advertiser:</label>
                <Box sx={{ color: theme.palette.text.primary, fontSize: "0.875rem" }}>{selectedRequest.Advertiser?.Advertiser || "N/A"}</Box>
              </Box>
              <Box>
                <label style={{ color: theme.palette.text.secondary, fontSize: "0.875rem" }}>Cost:</label>
                <Box sx={{ color: theme.palette.text.primary, fontSize: "0.875rem" }}>{selectedRequest.Cost ? Number(selectedRequest.Cost).toFixed(2) : "N/A"}</Box>
              </Box>
              <Box>
                <label style={{ color: theme.palette.text.secondary, fontSize: "0.875rem" }}>Proxy:</label>
                <Box sx={{ color: theme.palette.text.primary, fontSize: "0.875rem" }}>{selectedRequest.Proxy || "N/A"}</Box>
              </Box>
              <Box>
                <label style={{ color: theme.palette.text.secondary, fontSize: "0.875rem" }}>Cap Click:</label>
                <Box sx={{ color: theme.palette.text.primary, fontSize: "0.875rem" }}>{selectedRequest.DailyCapClick || "N/A"}</Box>
              </Box>
              <Box>
                <label style={{ color: theme.palette.text.secondary, fontSize: "0.875rem" }}>Cap Install/Event:</label>
                <Box sx={{ color: theme.palette.text.primary, fontSize: "0.875rem" }}>{selectedRequest.DailyCap || "N/A"}</Box>
              </Box>
              <Box>
                <label style={{ color: theme.palette.text.secondary, fontSize: "0.875rem" }}>PostBack URL:</label>
                <Box sx={{ color: theme.palette.text.primary, fontSize: "0.875rem", wordBreak: "break-all" }}>{selectedRequest.Campaign?.URL || "N/A"}</Box>
              </Box>
            </Box>
            <Button
              onClick={() => setSelectedRequest(null)}
              variant="contained"
              color="error"
              size="medium"
              sx={{ mt: 4, minWidth: 100, height: 40 }}
            >
              Close
            </Button>
          </Box>
        </Box>
      )}

      {editRequest && (
        <Box sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: "background.paper", p: { xs: 3, sm: 4 }, borderRadius: 2, maxWidth: 400, boxShadow: 3, color: theme.palette.text.primary }}>
            <h3 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: theme.palette.text.primary }}>
              {editRequest.OfferID ? "Edit Offer" : "Add Offer"}
            </h3>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
              <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '1px' }}>
                Offer
              </label>
                <Input
                  fullWidth
                  name="Offer"
                  value={editRequest.Offer || ""}
                  onChange={handleInputChange}
                  sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                />
              </Box>
              <Box>
              <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '1px' }}>
                Cost
              </label>
                <Input
                  type="number"
                  fullWidth
                  name="Cost"
                  value={editRequest.Cost ? Number(editRequest.Cost).toFixed(2) : ""}
                  onChange={handleInputChange}
                  sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                  startAdornment={<Box sx={{ color: theme.palette.text.secondary, mr: 1 }}>$</Box>}
                />
              </Box>
              <Box>
              <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '1px' }}>
                Proxy
              </label>
                <Input
                  type="text"
                  fullWidth
                  name="Proxy"
                  value={editRequest.Proxy || ""}
                  onChange={handleInputChange}
                  sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                />
              </Box>
              <Box>
              <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '1px' }}>
                Cap Clicks
              </label>
                <Input
                  type="number"
                  fullWidth
                  name="DailyCapClick"
                  value={editRequest.DailyCapClick || ""}
                  onChange={handleInputChange}
                  sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                />
              </Box>
              <Box>
              <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '1px' }}>
                Cap Install
              </label>
                <Input
                  type="number"
                  fullWidth
                  name="DailyCap"
                  value={editRequest.DailyCap || ""}
                  onChange={handleInputChange}
                  sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                />
              </Box>
              <Box>
              <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '1px' }}>
                PostBack URL
              </label>
                <Input
                  type="text"
                  fullWidth
                  name="URL"
                  value={editRequest.Campaign?.URL || ""}
                  onChange={handleInputChange}
                  sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                />
              </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
              {hasChanges() && (
                <Button
                  onClick={editOfferRequest}
                  variant="contained"
                  color="primary"
                  size="medium"
                  disabled={loading}
                  sx={{ minWidth: 100, height: 40 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              )}
              <Button
                onClick={() => {
                  setEditRequest(null);
                  setInitialEditRequest(null);
                }}
                variant="outlined"
                color="inherit"
                size="medium"
                disabled={loading}
                sx={{ minWidth: 100, height: 40 }}
              >
                Close
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ShowRequestOffers;