"use client";

import React, { useEffect, useState } from "react";
import {
  getSuppliers,
  getManagers,
  getUserPassword,
  changeUserPassword,
} from "@/app/api/filtersService/filtersService";
import { FaSync } from "react-icons/fa";
import { EyeIcon, EyeSlashIcon, ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/solid";
import apiClient from "@/libs/axiosConfig";
import arrayContactTypes from "@/libs/contactType";
import { saveOrUpdateContact, deleteContact } from "@/app/api/contact/service";
import { Tooltip } from "react-tooltip";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  useTheme,
  Menu,
  Typography,
} from "@mui/material";

// Define interfaces for type safety
interface Supplier {
  SupplierID: string;
  Supplier: string;
  PostBackURL: string;
  AccountManager: string;
  AccountManagerID: string;
  FantasyName: string;
  LegalName: string;
  IDNumber: string;
  Address: string;
  Country: string;
  StatusID: string;
  ApiKey: string;
  Offers?: number;
}

interface Manager {
  AccountManagerID: string;
  AccountManager: string;
}

interface Contact {
  ContactID: string;
  SupplierID: string;
  AdvertiserID: string;
  ContactTypeID: string;
  Name: string;
  JobDescription: string;
  Phone: string;
  EMail: string;
  SkypeID: string;
  HaveUserAccessConnect: number;
  StatusID: string;
  ContactType: string;
}

const ShowPublisher: React.FC = () => {
  const theme = useTheme();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchSupplier, setSearchSupplier] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchManager, setSearchManager] = useState("");
  const [managers, setManagers] = useState<Manager[]>([]);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const [selectedSupplierID, setSelectedSupplierID] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact>({
    ContactID: "0",
    SupplierID: "0",
    AdvertiserID: "0",
    ContactTypeID: "",
    Name: "",
    JobDescription: "",
    Phone: "",
    EMail: "",
    SkypeID: "",
    HaveUserAccessConnect: 0,
    StatusID: "A",
    ContactType: "",
  });
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [passwordUpdateMessage, setPasswordUpdateMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatchError, setPasswordMismatchError] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    uppercase: false,
    specialChar: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuContactID, setMenuContactID] = useState<string | null>(null);

  const statusMap: Record<string, string> = {
    A: "Active",
    I: "Inactive",
    B: "Blocked",
  };

  const [newSupplier, setNewSupplier] = useState<Supplier>({
    SupplierID: "",
    Supplier: "",
    PostBackURL: "",
    AccountManagerID: "",
    AccountManager: "",
    FantasyName: "",
    LegalName: "",
    IDNumber: "",
    Address: "",
    Country: "",
    StatusID: "",
    ApiKey: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getSuppliers();
        if (response.result && Array.isArray(response.result)) {
          setSuppliers(response.result);
          setFilteredSuppliers(response.result);
        } else {
          console.error("Error: La API de suppliers no contiene 'result'");
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchManagers = async () => {
      setIsLoading(true);
      try {
        const response = await getManagers();
        if (response.result && Array.isArray(response.result)) {
          setManagers(response.result);
        } else {
          console.error("Error: La API de managers no contiene 'result'");
        }
      } catch (error) {
        console.error("Error fetching managers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    fetchManagers();
  }, []);

  useEffect(() => {
    setFilteredSuppliers(
      suppliers.filter((supplier) =>
        (supplier.Supplier || "").toLowerCase().includes(searchSupplier.toLowerCase()) &&
        (supplier.StatusID || "").toLowerCase().includes(searchStatus.toLowerCase()) &&
        (supplier.AccountManager || "").toLowerCase().includes(searchManager.toLowerCase())
      )
    );
  }, [searchSupplier, searchStatus, searchManager, suppliers]);

  useEffect(() => {
    const minLength = newPassword.length >= 6;
    const uppercase = /[A-Z]/.test(newPassword);
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    setPasswordRequirements({
      minLength,
      uppercase,
      specialChar,
    });

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setPasswordMismatchError("Passwords do not match.");
    } else {
      setPasswordMismatchError("");
    }
  }, [newPassword, confirmPassword]);

  const handleEdit = (supplier: Supplier) => {
    setEditSupplier(supplier);
    setModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!editSupplier) return;
    setIsLoading(true);
    try {
      await apiClient.put(
        `/suppliers`,
        {
          SupplierID: editSupplier.SupplierID,
          Supplier: editSupplier.Supplier,
          PostBackURL: editSupplier.PostBackURL,
          StatusID: editSupplier.StatusID,
          AccountManagerID: editSupplier.AccountManagerID,
          FantasyName: editSupplier.FantasyName,
          LegalName: editSupplier.LegalName,
          Address: editSupplier.Address,
          Country: editSupplier.Country,
          IDNumber: editSupplier.IDNumber,
          ApiKey: editSupplier.ApiKey,
        },
        {
          headers: {
            "Access-Token": localStorage.getItem("accessToken"),
          },
        }
      );

      setModalOpen(false);
      const updatedSuppliers = suppliers.map((s) =>
        s.SupplierID === editSupplier.SupplierID ? editSupplier : s
      );
      setSuppliers(updatedSuppliers);
      setFilteredSuppliers(updatedSuppliers);
      alert("Supplier actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el supplier:", error);
      alert("Error al actualizar el supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async (supplierID: string) => {
    try {
      const selectedSupplier = suppliers.find((s) => s.SupplierID === supplierID);
      if (selectedSupplier) {
        setViewSupplier(selectedSupplier);
        setViewModalOpen(true);
      } else {
        console.error("No se encontraron datos del proveedor con ID:", supplierID);
      }
    } catch (error) {
      console.error("Error obteniendo detalles del supplier:", error);
    }
  };

  const handleContacts = async (supplierID: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/contacts?SupplierID=${supplierID}`, {
        headers: {
          "Access-Token": localStorage.getItem("accessToken"),
        },
      });

      if (response.data && response.data.result) {
        setContacts(response.data.result);
      } else {
        setContacts([]);
      }
      setSelectedSupplierID(supplierID);
      setContactsModalOpen(true);
    } catch (error) {
      console.error("Error obteniendo contactos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (supplierID: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.delete(`/suppliers?SupplierID=${supplierID}`, {
        headers: {
          "Access-Token": localStorage.getItem("accessToken"),
        },
      });

      const updatedSuppliers = suppliers.filter((supplier) => supplier.SupplierID !== supplierID);
      setSuppliers(updatedSuppliers);
      setFilteredSuppliers(updatedSuppliers);
      alert("Supplier eliminado correctamente");
    } catch (error) {
      console.error("Error eliminando el supplier:", error);
      alert("Error al eliminar el supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    setNewSupplier({
      SupplierID: "",
      Supplier: "",
      PostBackURL: "",
      AccountManagerID: "",
      AccountManager: "",
      FantasyName: "",
      LegalName: "",
      IDNumber: "",
      Address: "",
      Country: "",
      StatusID: "",
      ApiKey: "",
    });
  };

  const handleAddSupplier = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(
        `/suppliers`,
        {
          SupplierID: "0",
          Supplier: newSupplier.Supplier,
          Web: "",
          FaceBook: "",
          Twitter: "",
          GooglePlus: "",
          PostBackURL: newSupplier.PostBackURL,
          StatusID: newSupplier.StatusID,
          AdvertiserID: "0",
          GroupID: "0",
          Click2: "0",
          AccountManagerID: newSupplier.AccountManagerID,
          FantasyName: newSupplier.FantasyName,
          LegalName: newSupplier.LegalName,
          Address: newSupplier.Address,
          Country: newSupplier.Country,
          IDNumber: newSupplier.IDNumber || "",
        },
        {
          headers: {
            "Access-Token": localStorage.getItem("accessToken"),
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setSuppliers([...suppliers, response.data]);
        setFilteredSuppliers([...filteredSuppliers, response.data]);
        handleCloseAddModal();
        alert("Supplier agregado correctamente");
      }
    } catch (error) {
      console.error("Error al agregar el proveedor:", error);
      alert("Error al agregar el supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const response = await getSuppliers();
      if (response.result && Array.isArray(response.result)) {
        setSuppliers(response.result);
        setFilteredSuppliers(response.result);
      } else {
        console.error("Error: La API de suppliers no contiene 'result'");
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateContactModal = (supplierID: string) => {
    setCurrentContact({
      ContactID: "0",
      SupplierID: supplierID,
      AdvertiserID: "0",
      ContactTypeID: "",
      Name: "",
      JobDescription: "",
      Phone: "",
      EMail: "",
      SkypeID: "",
      HaveUserAccessConnect: 0,
      StatusID: "A",
      ContactType: "",
    });
    setIsEditingContact(false);
    setIsContactModalOpen(true);
  };

  const handleOpenEditContactModal = (contact: Contact) => {
    const contactType = arrayContactTypes.find(
      (type) => type.TypeID === contact.ContactTypeID
    );

    setCurrentContact({
      ContactID: contact.ContactID,
      SupplierID: contact.SupplierID || selectedSupplierID || "0",
      AdvertiserID: "0",
      ContactTypeID: contact.ContactTypeID || "",
      Name: contact.Name || "",
      JobDescription: contact.JobDescription || "",
      Phone: contact.Phone || "",
      EMail: contact.EMail || "",
      SkypeID: contact.SkypeID || "",
      HaveUserAccessConnect: contact.HaveUserAccessConnect || 0,
      StatusID: contact.StatusID || "A",
      ContactType: contactType ? contactType.Description : contact.ContactType || "",
    });
    setIsEditingContact(true);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async () => {
    setIsLoading(true);
    try {
      if (isEditingContact) {
        await saveOrUpdateContact("PUT", currentContact);
        alert("Contacto actualizado correctamente");
      } else {
        await saveOrUpdateContact("POST", currentContact);
        alert("Contacto creado correctamente");
      }

      const response = await apiClient.get(`/contacts?SupplierID=${currentContact.SupplierID}`, {
        headers: {
          "Access-Token": localStorage.getItem("accessToken"),
        },
      });
      setContacts(response.data.result || []);
      setIsContactModalOpen(false);
    } catch (error) {
      console.error(
        isEditingContact
          ? "Error al actualizar el contacto:"
          : "Error al crear el contacto:",
        error
      );
      alert(
        isEditingContact
          ? "Error al actualizar el contacto"
          : "Error al crear el contacto"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContact = async (contactID: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este contacto?")) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteContact(parseInt(contactID));
      setContacts(contacts.filter((contact) => contact.ContactID !== contactID));
      alert("Contacto eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el contacto:", error);
      alert("Error al eliminar el contacto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const data = await getUserPassword(email);
      const pass = descifradoXOR(data.result, "claveSecreta");
      if (pass) {
        setPassword(pass);
        setIsPasswordModalOpen(true);
        setIsCopied(false);
      } else {
        alert("No se pudo obtener la contraseña.");
      }
    } catch (error) {
      console.error("Error al obtener la contraseña:", error);
      alert("Error al obtener la contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  function descifradoXOR(textoEncriptado: string, clave: string) {
    return cifradoXOR(textoEncriptado, clave);
  }

  function cifradoXOR(texto: string, clave: string) {
    let resultado = "";
    for (let i = 0; i < texto.length; i++) {
      const charCodeTexto = texto.charCodeAt(i);
      const charCodeClave = clave.charCodeAt(i % clave.length);
      const charCodeEncriptado = charCodeTexto ^ charCodeClave;
      resultado += String.fromCharCode(charCodeEncriptado);
    }
    return resultado;
  }

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Error copying password:", error);
      alert("Failed to copy password. Please try again.");
    }
  };

  const handleOpenChangePasswordModal = (email: string) => {
    setSelectedEmail(email);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordUpdateMessage("");
    setPasswordMismatchError("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordRequirements({
      minLength: false,
      uppercase: false,
      specialChar: false,
    });
    setIsChangePasswordModalOpen(true);
  };

  const handleCloseChangePasswordModal = () => {
    setNewPassword("");
    setConfirmPassword("");
    setPasswordUpdateMessage("");
    setPasswordMismatchError("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordRequirements({
      minLength: false,
      uppercase: false,
      specialChar: false,
    });
    setIsChangePasswordModalOpen(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMismatchError("Passwords do not match.");
      return;
    }

    const { minLength, uppercase, specialChar } = passwordRequirements;
    if (!minLength || !uppercase || !specialChar) {
      alert("Please ensure the new password meets all requirements.");
      return;
    }

    setIsLoading(true);
    try {
      await changeUserPassword(selectedEmail, newPassword);
      setPasswordUpdateMessage("Password has been updated.");
      setTimeout(() => {
        handleCloseChangePasswordModal();
      }, 2000);
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      alert("Error al cambiar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, contactID: string) => {
    setAnchorEl(event.currentTarget);
    setMenuContactID(contactID);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuContactID(null);
  };

  const isFormValid =
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword &&
    passwordRequirements.minLength &&
    passwordRequirements.uppercase &&
    passwordRequirements.specialChar;

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, boxShadow: 1, color: theme.palette.text.primary }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
          Suppliers
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2, bgcolor: 'background.paper', p: 2, borderRadius: 1, color: theme.palette.text.primary }}>
        <Box>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search supplier"
            value={searchSupplier}
            onChange={(e) => setSearchSupplier(e.target.value)}
            sx={{ bgcolor: 'background.paper' }}
          />
        </Box>
        <Box>
          <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'background.paper' }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="">
                <em>Select a Status...</em>
              </MenuItem>
              {Object.entries(statusMap).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box>
          <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'background.paper' }}>
            <InputLabel>Account Manager</InputLabel>
            <Select
              value={searchManager}
              onChange={(e) => setSearchManager(e.target.value)}
              label="Account Manager"
            >
              <MenuItem value="">
                <em>Select Account Manager</em>
              </MenuItem>
              {managers.map((manager) => (
                <MenuItem key={manager.AccountManagerID} value={manager.AccountManager}>
                  {manager.AccountManager}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button
            onClick={handleOpenAddModal}
            variant="contained"
            color="success"
            size="medium"
            startIcon={<span>+</span>}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: '100%', sm: 120 },
              height: 40,
              fontSize: '1rem',
            }}
            data-tooltip-id="add-tooltip"
            data-tooltip-content="Add a new supplier"
          >
            Add
          </Button>
          <Tooltip id="add-tooltip" />
          <Button
            onClick={fetchSuppliers}
            variant="contained"
            color="primary"
            size="medium"
            startIcon={<FaSync />}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: '100%', sm: 120 },
              height: 40,
              fontSize: '1rem',
            }}
            data-tooltip-id="refresh-tooltip"
            data-tooltip-content="Refresh suppliers list"
          >
            Refresh
          </Button>
          <Tooltip id="refresh-tooltip" />
        </Box>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Box sx={{ mt: 3, overflowX: 'auto', pb: 2 }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', borderRadius: 1, overflow: 'hidden' }}>
          <Box component="thead">
            <Box component="tr" sx={{ bgcolor: theme.palette.grey[100] }}>
              <Box component="th" sx={{ border: `1px solid ${theme.palette.divider}`, p: 2, textAlign: 'left', color: theme.palette.text.secondary, fontWeight: 'bold' }}>Supplier</Box>
              <Box component="th" sx={{ border: `1px solid ${theme.palette.divider}`, p: 2, textAlign: 'left', color: theme.palette.text.secondary, fontWeight: 'bold' }}>Status</Box>
              <Box component="th" sx={{ border: `1px solid ${theme.palette.divider}`, p: 2, textAlign: 'left', color: theme.palette.text.secondary, fontWeight: 'bold' }}>Account Manager</Box>
              <Box component="th" sx={{ border: `1px solid ${theme.palette.divider}`, p: 2, textAlign: 'left', color: theme.palette.text.secondary, fontWeight: 'bold' }}>PostBackURL</Box>
              <Box component="th" sx={{ border: `1px solid ${theme.palette.divider}`, p: 2, textAlign: 'left', color: theme.palette.text.secondary, fontWeight: 'bold' }}>Offers</Box>
              <Box component="th" sx={{ border: `1px solid ${theme.palette.divider}`, p: 2, textAlign: 'left', color: theme.palette.text.secondary, fontWeight: 'bold' }}>Address</Box>
              <Box component="th" sx={{ border: `1px solid ${theme.palette.divider}`, p: 2, textAlign: 'left', color: theme.palette.text.secondary, fontWeight: 'bold' }}>Actions</Box>
            </Box>
          </Box>
          <Box component="tbody">
            {filteredSuppliers.map((supplier) => (
              <Box component="tr" key={supplier.SupplierID} sx={{ border: `1px solid ${theme.palette.divider}`, '&:hover': { bgcolor: theme.palette.action.hover } }}>
                <Box component="td" sx={{ p: 2, color: theme.palette.text.primary }}>{supplier.Supplier || "N/A"}</Box>
                <Box component="td" sx={{ p: 2, color: theme.palette.text.primary }}>{statusMap[supplier.StatusID] || "N/A"}</Box>
                <Box component="td" sx={{ p: 2, color: theme.palette.text.primary }}>{supplier.AccountManager || "N/A"}</Box>
                <Box component="td" sx={{ p: 2, color: theme.palette.text.primary, maxWidth: 'xs', overflow: 'hidden', textOverflow: 'ellipsis' }}>{supplier.PostBackURL || "N/A"}</Box>
                <Box component="td" sx={{ p: 2, color: theme.palette.text.primary }}>{supplier.Offers || 0}</Box>
                <Box component="td" sx={{ p: 2, color: theme.palette.text.primary }}>{supplier.Address || "N/A"}</Box>
                <Box component="td" sx={{ p: 2, display: 'flex', gap: 1 }}>
                  <Button
                    onClick={() => handleEdit(supplier)}
                    variant="contained"
                    size="small"
                    sx={{
                      minWidth: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: theme.palette.grey[300],
                      color: theme.palette.text.primary,
                      '&:hover': {
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                      },
                      p: 0.5,
                    }}
                    data-tooltip-id={`edit-supplier-tooltip-${supplier.SupplierID}`}
                    data-tooltip-content="Edit supplier"
                  >
                    ✎
                  </Button>
                  <Tooltip id={`edit-supplier-tooltip-${supplier.SupplierID}`} />
                  <Button
                    onClick={() => handleContacts(supplier.SupplierID)}
                    variant="contained"
                    size="small"
                    sx={{
                      minWidth: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: theme.palette.grey[300],
                      color: theme.palette.text.primary,
                      '&:hover': {
                        bgcolor: theme.palette.grey[600],
                        color: theme.palette.grey[100],
                      },
                      p: 0.5,
                    }}
                    data-tooltip-id={`contacts-tooltip-${supplier.SupplierID}`}
                    data-tooltip-content="View contacts"
                  >
                    👤
                  </Button>
                  <Tooltip id={`contacts-tooltip-${supplier.SupplierID}`} />
                  <Button
                    onClick={() => handleView(supplier.SupplierID)}
                    variant="contained"
                    size="small"
                    sx={{
                      minWidth: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: theme.palette.grey[300],
                      color: theme.palette.text.primary,
                      '&:hover': {
                        bgcolor: theme.palette.grey[600],
                        color: theme.palette.grey[100],
                      },
                      p: 0.5,
                    }}
                    data-tooltip-id={`view-supplier-tooltip-${supplier.SupplierID}`}
                    data-tooltip-content="View supplier details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </Button>
                  <Tooltip id={`view-supplier-tooltip-${supplier.SupplierID}`} />
                  <Button
                    onClick={() => handleDelete(supplier.SupplierID)}
                    variant="contained"
                    size="small"
                    sx={{
                      minWidth: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: theme.palette.grey[300],
                      color: theme.palette.text.primary,
                      '&:hover': {
                        bgcolor: theme.palette.error.main,
                        color: theme.palette.error.contrastText,
                      },
                      p: 0.5,
                    }}
                    data-tooltip-id={`delete-supplier-tooltip-${supplier.SupplierID}`}
                    data-tooltip-content="Delete supplier"
                  >
                    ✖
                  </Button>
                  <Tooltip id={`delete-supplier-tooltip-${supplier.SupplierID}`} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {addModalOpen && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, maxWidth: 'lg', maxHeight: '90vh', overflowY: 'auto', boxShadow: 3, color: theme.palette.text.primary }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center', color: theme.palette.text.primary }}>
              Add new supplier
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {[
                "Supplier",
                "PostBackURL",
                "FantasyName",
                "LegalName",
                "IDNumber",
                "Address",
                "Country",
              ].map((field) => (
                <Box key={field}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label={field.replace(/([A-Z])/g, " $1").trim()}
                    value={newSupplier[field as keyof Supplier]}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, [field]: e.target.value })
                    }
                    sx={{ bgcolor: 'background.paper' }}
                  />
                </Box>
              ))}
              <Box>
                <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                  <InputLabel>Account Manager</InputLabel>
                  <Select
                    value={newSupplier.AccountManagerID}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, AccountManagerID: e.target.value })
                    }
                    label="Account Manager"
                  >
                    <MenuItem value="">
                      <em>Select Manager</em>
                    </MenuItem>
                    {managers.map((manager) => (
                      <MenuItem key={manager.AccountManagerID} value={manager.AccountManagerID}>
                        {manager.AccountManager}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newSupplier.StatusID}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, StatusID: e.target.value })
                    }
                    label="Status"
                  >
                    <MenuItem value="A">Active</MenuItem>
                    <MenuItem value="I">Inactive</MenuItem>
                    <MenuItem value="B">Blocked</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                onClick={handleCloseAddModal}
                variant="outlined"
                color="inherit"
                size="medium"
                disabled={isLoading}
                data-tooltip-id="close-add-tooltip"
                data-tooltip-content="Close the modal"
              >
                {isLoading ? <CircularProgress size={24} /> : "Close"}
              </Button>
              <Tooltip id="close-add-tooltip" />
              <Button
                onClick={handleAddSupplier}
                variant="contained"
                color="primary"
                size="medium"
                disabled={isLoading}
                data-tooltip-id="accept-add-tooltip"
                data-tooltip-content="Save the new supplier"
              >
                {isLoading ? <CircularProgress size={24} /> : "Accept"}
              </Button>
              <Tooltip id="accept-add-tooltip" />
            </Box>
          </Box>
        </Box>
      )}

      {viewModalOpen && viewSupplier && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, maxWidth: 'md', maxHeight: '90vh', overflowY: 'auto', boxShadow: 3, color: theme.palette.text.primary }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.divider}`, pb: 2, textAlign: 'center', color: theme.palette.text.primary }}>
              Supplier Details: {viewSupplier.Supplier || ""}
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {viewSupplier.Supplier && (
                <Typography sx={{ color: theme.palette.text.primary }}><strong>Supplier:</strong> {viewSupplier.Supplier}</Typography>
              )}
              {viewSupplier.PostBackURL && (
                <Typography sx={{ color: theme.palette.text.primary }}><strong>URL PostBack:</strong> {viewSupplier.PostBackURL}</Typography>
              )}
              {viewSupplier.AccountManager && (
                <Typography sx={{ color: theme.palette.text.primary }}><strong>Account Manager:</strong> {viewSupplier.AccountManager}</Typography>
              )}
              {viewSupplier.FantasyName && (
                <Typography sx={{ color: theme.palette.text.primary }}><strong>Fantasy Name:</strong> {viewSupplier.FantasyName}</Typography>
              )}
              {viewSupplier.LegalName && (
                <Typography sx={{ color: theme.palette.text.primary }}><strong>Legal Name:</strong> {viewSupplier.LegalName}</Typography>
              )}
              {viewSupplier.IDNumber && (
                <Typography sx={{ color: theme.palette.text.primary }}><strong>ID Number:</strong> {viewSupplier.IDNumber}</Typography>
              )}
              {viewSupplier.Address && (
                <Typography sx={{ color: theme.palette.text.primary }}><strong>Address:</strong> {viewSupplier.Address}</Typography>
              )}
              {viewSupplier.Country && (
                <Typography sx={{ color: theme.palette.text.primary }}><strong>Country:</strong> {viewSupplier.Country}</Typography>
              )}
              {viewSupplier.StatusID && (
                <Typography sx={{ color: theme.palette.text.primary }}><strong>Status:</strong> {statusMap[viewSupplier.StatusID]}</Typography>
              )}
            </Box>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setViewModalOpen(false)}
                variant="outlined"
                color="inherit"
                size="medium"
                data-tooltip-id="close-view-tooltip"
                data-tooltip-content="Close the modal"
              >
                Close
              </Button>
              <Tooltip id="close-view-tooltip" />
            </Box>
          </Box>
        </Box>
      )}

      {contactsModalOpen && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, maxWidth: 'md', boxShadow: 3, color: theme.palette.text.primary }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
              Contacts for Supplier
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search"
              sx={{ mb: 2, bgcolor: 'background.paper' }}
            />
            <Button
              onClick={() => handleOpenCreateContactModal(selectedSupplierID || "0")}
              variant="contained"
              color="primary"
              size="medium"
              sx={{ mb: 2 }}
              disabled={isLoading}
              data-tooltip-id="add-contact-tooltip"
              data-tooltip-content="Add a new contact"
            >
              {isLoading ? <CircularProgress size={24} /> : "Add contact"}
            </Button>
            <Tooltip id="add-contact-tooltip" />
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <Box
                  key={contact.ContactID}
                  sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: theme.palette.grey[50], p: 3, borderRadius: 1, boxShadow: 1 }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      {contact.Name} ({contact.ContactID})
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.secondary }}>{contact.EMail || "No disponible"}</Typography>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                      {contact.Phone || "No disponible"}
                    </Typography>
                  </Box>
                  <Box>
                    <Button
                      onClick={(e) => handleMenuOpen(e, contact.ContactID)}
                      variant="text"
                      size="small"
                      sx={{ minWidth: 0, p: 0.5, color: theme.palette.text.secondary, '&:hover': { color: theme.palette.text.primary } }}
                    >
                      ⋮
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && menuContactID === contact.ContactID}
                      onClose={handleMenuClose}
                      sx={{ '& .MuiPaper-root': { bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 3 } }}
                    >
                      <MenuItem
                        onClick={() => {
                          handleOpenEditContactModal(contact);
                          handleMenuClose();
                        }}
                        data-tooltip-id={`edit-contact-tooltip-${contact.ContactID}`}
                        data-tooltip-content="Edit contact"
                      >
                        Edit
                      </MenuItem>
                      <Tooltip id={`edit-contact-tooltip-${contact.ContactID}`} />
                      {contact.HaveUserAccessConnect ? (
                        <>
                          <MenuItem
                            onClick={() => {
                              handleViewPassword(contact.EMail);
                              handleMenuClose();
                            }}
                            data-tooltip-id={`view-password-tooltip-${contact.ContactID}`}
                            data-tooltip-content="View password"
                          >
                            View password
                          </MenuItem>
                          <Tooltip id={`view-password-tooltip-${contact.ContactID}`} />
                          <MenuItem
                            onClick={() => {
                              handleOpenChangePasswordModal(contact.EMail);
                              handleMenuClose();
                            }}
                            data-tooltip-id={`change-password-tooltip-${contact.ContactID}`}
                            data-tooltip-content="Change password"
                          >
                            Change password
                          </MenuItem>
                          <Tooltip id={`change-password-tooltip-${contact.ContactID}`} />
                        </>
                      ) : null}
                      <MenuItem
                        onClick={() => {
                          handleDeleteContact(contact.ContactID);
                          handleMenuClose();
                        }}
                        sx={{ color: theme.palette.error.main }}
                        data-tooltip-id={`delete-contact-tooltip-${contact.ContactID}`}
                        data-tooltip-content="Delete contact"
                      >
                        Delete
                      </MenuItem>
                      <Tooltip id={`delete-contact-tooltip-${contact.ContactID}`} />
                    </Menu>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography sx={{ color: theme.palette.text.secondary }}>No contacts found.</Typography>
            )}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setContactsModalOpen(false)}
                variant="outlined"
                color="inherit"
                size="medium"
                disabled={isLoading}
                data-tooltip-id="close-contacts-tooltip"
                data-tooltip-content="Close the modal"
              >
                {isLoading ? <CircularProgress size={24} /> : "Close"}
              </Button>
              <Tooltip id="close-contacts-tooltip" />
            </Box>
          </Box>
        </Box>
      )}

      {modalOpen && editSupplier && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, maxWidth: 'lg', maxHeight: '90vh', overflowY: 'auto', boxShadow: 3, color: theme.palette.text.primary }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', borderBottom: `1px solid ${theme.palette.divider}`, pb: 2, textAlign: 'center', color: theme.palette.text.primary }}>
              Edit: {editSupplier.Supplier || "Unknown"}
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                "Supplier",
                "PostBackURL",
                "FantasyName",
                "LegalName",
                "IDNumber",
                "Address",
                "Country",
              ].map((field) => (
                <TextField
                  key={field}
                  fullWidth
                  variant="outlined"
                  label={field.replace(/([A-Z])/g, " $1").trim()}
                  value={editSupplier[field as keyof Supplier] || ""}
                  onChange={(e) =>
                    setEditSupplier({ ...editSupplier, [field]: e.target.value })
                  }
                  sx={{ bgcolor: 'background.paper' }}
                />
              ))}
              <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                <InputLabel>Account Manager</InputLabel>
                <Select
                  value={editSupplier.AccountManagerID || ""}
                  onChange={(e) =>
                    setEditSupplier({ ...editSupplier, AccountManagerID: e.target.value })
                  }
                  label="Account Manager"
                >
                  {managers.map((manager) => (
                    <MenuItem key={manager.AccountManagerID} value={manager.AccountManagerID}>
                      {manager.AccountManager}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editSupplier.StatusID || ""}
                  onChange={(e) =>
                    setEditSupplier({ ...editSupplier, StatusID: e.target.value })
                  }
                  label="Status"
                >
                  <MenuItem value="A">Active</MenuItem>
                  <MenuItem value="I">Inactive</MenuItem>
                  <MenuItem value="B">Blocked</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                onClick={() => setModalOpen(false)}
                variant="outlined"
                color="inherit"
                size="medium"
                disabled={isLoading}
                data-tooltip-id="close-edit-tooltip"
                data-tooltip-content="Close the modal"
              >
                {isLoading ? <CircularProgress size={24} /> : "Close"}
              </Button>
              <Tooltip id="close-edit-tooltip" />
              <Button
                onClick={handleSaveChanges}
                variant="contained"
                color="primary"
                size="medium"
                disabled={isLoading}
                data-tooltip-id="save-edit-tooltip"
                data-tooltip-content="Save changes"
              >
                {isLoading ? <CircularProgress size={24} /> : "Save"}
              </Button>
              <Tooltip id="save-edit-tooltip" />
            </Box>
          </Box>
        </Box>
      )}

      {isContactModalOpen && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, maxWidth: { xs: '90%', sm: 'md' }, maxHeight: '90vh', overflowY: 'auto', boxShadow: 3, color: theme.palette.text.primary }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
              {isEditingContact ? "Edit contact" : "Create new contact"}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={currentContact.HaveUserAccessConnect === 1}
                    onChange={(e) =>
                      setCurrentContact({
                        ...currentContact,
                        HaveUserAccessConnect: e.target.checked ? 1 : 0,
                      })
                    }
                    sx={{ color: theme.palette.primary.main }}
                  />
                }
                label="Enable login"
                sx={{ color: theme.palette.text.primary }}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Name"
                value={currentContact.Name}
                onChange={(e) =>
                  setCurrentContact({ ...currentContact, Name: e.target.value })
                }
                sx={{ bgcolor: 'background.paper' }}
              />
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                  <InputLabel>Contact type</InputLabel>
                  <Select
                    value={currentContact.ContactTypeID}
                    onChange={(e) => {
                      const selectedType = arrayContactTypes.find(
                        (type) => type.TypeID === e.target.value
                      );
                      setCurrentContact({
                        ...currentContact,
                        ContactTypeID: e.target.value,
                        ContactType: selectedType ? selectedType.Description : "",
                      });
                    }}
                    label="Contact type"
                  >
                    <MenuItem value="">
                      <em>Select Contact Type</em>
                    </MenuItem>
                    {arrayContactTypes.map((type) => (
                      <MenuItem key={type.TypeID} value={type.TypeID}>
                        {type.Description}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Phone"
                  value={currentContact.Phone || ""}
                  onChange={(e) =>
                    setCurrentContact({ ...currentContact, Phone: e.target.value })
                  }
                  sx={{ bgcolor: 'background.paper' }}
                />
              </Box>
              <TextField
                fullWidth
                variant="outlined"
                label="E-mail"
                type="email"
                value={currentContact.EMail}
                onChange={(e) =>
                  setCurrentContact({ ...currentContact, EMail: e.target.value })
                }
                sx={{ bgcolor: 'background.paper' }}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Job description"
                value={currentContact.JobDescription}
                onChange={(e) =>
                  setCurrentContact({ ...currentContact, JobDescription: e.target.value })
                }
                sx={{ bgcolor: 'background.paper' }}
              />
              <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentContact.StatusID}
                  onChange={(e) =>
                    setCurrentContact({ ...currentContact, StatusID: e.target.value })
                  }
                  label="Status"
                >
                  <MenuItem value="A">Active</MenuItem>
                  <MenuItem value="I">Inactive</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                variant="outlined"
                label="Skype"
                value={currentContact.SkypeID || ""}
                onChange={(e) =>
                  setCurrentContact({ ...currentContact, SkypeID: e.target.value })
                }
                sx={{ bgcolor: 'background.paper' }}
              />
            </Box>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                onClick={() => setIsContactModalOpen(false)}
                variant="outlined"
                color="inherit"
                size="medium"
                disabled={isLoading}
                data-tooltip-id="close-contact-tooltip"
                data-tooltip-content="Close the modal"
              >
                {isLoading ? <CircularProgress size={24} /> : "Close"}
              </Button>
              <Tooltip id="close-contact-tooltip" />
              <Button
                onClick={handleSaveContact}
                variant="contained"
                color="primary"
                size="medium"
                disabled={isLoading}
                data-tooltip-id="accept-contact-tooltip"
                data-tooltip-content={isEditingContact ? "Update contact" : "Create contact"}
              >
                {isLoading ? <CircularProgress size={24} /> : "Accept"}
              </Button>
              <Tooltip id="accept-contact-tooltip" />
            </Box>
          </Box>
        </Box>
      )}

      {isPasswordModalOpen && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, maxWidth: 'md', boxShadow: 3, color: theme.palette.text.primary }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.text.primary }}>
              Current password:
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                variant="outlined"
                value={password}
                inputProps={{ readOnly: true }}
                sx={{ bgcolor: 'background.paper', textAlign: 'center' }}
              />
              <Button
                onClick={handleCopyPassword}
                variant="text"
                size="small"
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isCopied ? theme.palette.success.main : theme.palette.text.secondary,
                  '&:hover': { color: theme.palette.text.primary },
                  minWidth: 0,
                  p: 0.5,
                }}
                data-tooltip-id="copy-password-tooltip"
                data-tooltip-content={isCopied ? "Copied!" : "Copy password"}
              >
                {isCopied ? <CheckIcon className="h-5 w-5" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
              </Button>
              <Tooltip id="copy-password-tooltip" />
            </Box>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setIsPasswordModalOpen(false)}
                variant="outlined"
                color="inherit"
                size="medium"
                disabled={isLoading}
                data-tooltip-id="close-password-tooltip"
                data-tooltip-content="Close the modal"
              >
                {isLoading ? <CircularProgress size={24} /> : "Close"}
              </Button>
              <Tooltip id="close-password-tooltip" />
            </Box>
          </Box>
        </Box>
      )}

      {isChangePasswordModalOpen && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, maxWidth: 'md', boxShadow: 3, color: theme.palette.text.primary }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.text.primary }}>
              Change password
            </Typography>
            {passwordUpdateMessage && (
              <Box sx={{ mb: 2, bgcolor: theme.palette.success.light, color: theme.palette.success.contrastText, p: 2, borderRadius: 1 }}>
                {passwordUpdateMessage}
              </Box>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label={<Box component="span"><Box component="span" sx={{ color: theme.palette.error.main }}>*</Box> Password</Box>}
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  sx={{ bgcolor: 'background.paper' }}
                />
                <Button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  variant="text"
                  size="small"
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: theme.palette.text.secondary,
                    '&:hover': { color: theme.palette.text.primary },
                    minWidth: 0,
                    p: 0.5,
                  }}
                  data-tooltip-id="show-new-password-tooltip"
                  data-tooltip-content={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </Button>
                <Tooltip id="show-new-password-tooltip" />
                <Box sx={{ mt: 2, bgcolor: theme.palette.grey[50], p: 2, borderRadius: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 'medium', color: theme.palette.text.secondary }}>
                    Password requirements:
                  </Typography>
                  <Box component="ul" sx={{ fontSize: '0.875rem', listStyle: 'none', p: 0, mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box component="li" sx={{ color: passwordRequirements.minLength ? theme.palette.success.main : theme.palette.error.main }}>
                      {passwordRequirements.minLength ? "✔" : "✘"} At least 6 characters
                    </Box>
                    <Box component="li" sx={{ color: passwordRequirements.uppercase ? theme.palette.success.main : theme.palette.error.main }}>
                      {passwordRequirements.uppercase ? "✔" : "✘"} At least one uppercase letter
                    </Box>
                    <Box component="li" sx={{ color: passwordRequirements.specialChar ? theme.palette.success.main : theme.palette.error.main }}>
                      {passwordRequirements.specialChar ? "✔" : "✘"} At least one special character
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label={<Box component="span"><Box component="span" sx={{ color: theme.palette.error.main }}>*</Box> Confirm password</Box>}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{ bgcolor: 'background.paper' }}
                />
                <Button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  variant="text"
                  size="small"
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: theme.palette.text.secondary,
                    '&:hover': { color: theme.palette.text.primary },
                    minWidth: 0,
                    p: 0.5,
                  }}
                  data-tooltip-id="show-confirm-password-tooltip"
                  data-tooltip-content={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </Button>
                <Tooltip id="show-confirm-password-tooltip" />
                {passwordMismatchError && (
                  <Typography sx={{ mt: 1, fontSize: '0.875rem', color: theme.palette.error.main }}>
                    {passwordMismatchError}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={handleCloseChangePasswordModal}
                variant="outlined"
                color="inherit"
                size="medium"
                disabled={isLoading}
                data-tooltip-id="close-change-password-tooltip"
                data-tooltip-content="Close the modal"
              >
                {isLoading ? <CircularProgress size={24} /> : "Close"}
              </Button>
              <Tooltip id="close-change-password-tooltip" />
              {isFormValid && (
                <Button
                  onClick={handleChangePassword}
                  variant="contained"
                  color="primary"
                  size="medium"
                  disabled={isLoading}
                  data-tooltip-id="update-password-tooltip"
                  data-tooltip-content="Update the password"
                >
                  {isLoading ? <CircularProgress size={24} /> : "Update Password"}
                </Button>
              )}
              <Tooltip id="update-password-tooltip" />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ShowPublisher;