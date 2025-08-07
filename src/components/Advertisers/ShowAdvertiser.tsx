"use client";

import apiClient from "@/libs/axiosConfig";
import React, { useEffect, useState } from "react";
import {
  getAdvertisers,
  getManagers,
  getContacts,
  getUserPassword,
  changeUserPassword,
} from "@/app/api/filtersService/filtersService";
import arrayContactTypes from "@/libs/contactType";
import { saveOrUpdateContact, deleteContact } from "@/app/api/contact/service";
import {
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import { Tooltip } from "react-tooltip";
import { Box, Button, useTheme, TextField, Select,Input, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox } from "@mui/material";

interface Manager {
  AccountManagerID: number;
  AccountManager: string;
}

interface Advertiser {
  AdvertiserID: number;
  Advertiser: string;
  AccountManagerID: number;
  FantasyName?: string;
  LegalName?: string;
  Address?: string;
  Country?: string;
  ContactName?: string;
  EMail?: string;
  TotalActiveCampaigns?: number;
}

function ShowAdvertiser() {
  const theme = useTheme();
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [advertiserSearch, setAdvertiserSearch] = useState("");
const [showAdvertiserSuggestions, setShowAdvertiserSuggestions] = useState(false);
  const [managerSearch, setManagerSearch] = useState("");
const [showManagerSuggestions, setShowManagerSuggestions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<any>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedAdvertiserID, setSelectedAdvertiserID] = useState<number | null>(null);

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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAdvertiser, setNewAdvertiser] = useState({
    Advertiser: "",
    AccountManagerID: "",
    FantasyName: "",
    LegalName: "",
    Address: "",
    Country: "",
    ContactName: "",
    EMail: "",
  });

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState({
    ContactID: 0,
    SupplierID: 0,
    AdvertiserID: 0,
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const advertisersData = await getAdvertisers();
        if (advertisersData.result && Array.isArray(advertisersData.result)) {
          setAdvertisers(advertisersData.result);
        } else {
          console.error("Error: La API de advertisers no contiene 'result'");
        }

        const managersData = await getManagers();
        if (managersData.result && Array.isArray(managersData.result)) {
          setManagers(managersData.result);
        } else {
          console.error("Error: La API de managers no contiene 'result'");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const getManagerName = (id: number) => {
    const manager = managers.find((m) => m.AccountManagerID === id);
    return manager ? manager.AccountManager : "N/A";
  };

  const handleEdit = (advertiser: any) => {
    setSelectedAdvertiser(advertiser);
    setIsModalOpen(true);
  };

  const filteredAdvertisers = advertisers.filter(
    (ad) =>
      ad.Advertiser.toLowerCase().includes(advertiserSearch.toLowerCase()) &&
      getManagerName(ad.AccountManagerID).toLowerCase().includes(managerSearch.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAdvertisers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAdvertisers = filteredAdvertisers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete?.ContactID) {
      try {
        await deleteContact(itemToDelete.ContactID);
        setContacts(
          contacts.filter(
            (contact) => contact.ContactID !== itemToDelete.ContactID,
          ),
        );
        alert("Contact deleted successfully");
      } catch (error) {
        console.error("Error al eliminar el contacto:", error);
        alert("Error deleting contact");
      }
    } else if (itemToDelete?.AdvertiserID) {
      try {
        setAdvertisers(
          advertisers.filter(
            (ad) => ad.AdvertiserID !== itemToDelete.AdvertiserID,
          ),
        );
        alert("Advertiser deleted successfully");
      } catch (error) {
        console.error("Error al eliminar el advertiser:", error);
        alert("Error deleting advertiser");
      }
    }

    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleViewContacts = async (advertiserID: number) => {
    try {
      const contactsData = await getContacts(advertiserID);
      setContacts(contactsData.result || []);
      setSelectedAdvertiserID(advertiserID);
      setIsContactsModalOpen(true);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleViewPassword = async (email: string) => {
    try {
      const data = await getUserPassword(email);
      const pass = descifradoXOR(data.result, "claveSecreta");
      if (pass) {
        setPassword(pass);
        setIsPasswordModalOpen(true);
      } else {
        alert("Could not retrieve password.");
      }
    } catch (error) {
      console.error("Error al obtener la contraseña:", error);
      alert("Error retrieving password.");
    }
  };

  function descifradoXOR(textoEncriptado: any, clave: string) {
    return cifradoXOR(textoEncriptado, clave);
  }

  function cifradoXOR(texto: any, clave: string) {
    let resultado = "";
    for (let i = 0; i < texto.length; i++) {
      const charCodeTexto = texto.charCodeAt(i);
      const charCodeClave = clave.charCodeAt(i % clave.length);
      const charCodeEncriptado = charCodeTexto ^ charCodeClave;
      resultado += String.fromCharCode(charCodeEncriptado);
    }
    return resultado;
  }

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

    try {
      await changeUserPassword(selectedEmail, newPassword);
      setPasswordUpdateMessage("Password has been updated.");
      setTimeout(() => {
        handleCloseChangePasswordModal();
      }, 2000);
    } catch (error) {
      alert("Error changing password");
    }
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleAddAdvertiser = async () => {
    try {
      const response = await apiClient.post("/advertisers", newAdvertiser, {
        headers: {
          "Access-Token": localStorage.getItem("accessToken"),
          "Content-Type": "application/json",
        },
      });
      alert("Advertiser added successfully");
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error al agregar el advertiser:", error);
      alert("Error adding advertiser");
    }
  };

  const handleSaveAdvertiser = async () => {
    if (!selectedAdvertiser) return;

    try {
      const response = await apiClient.put(
        `/advertisers?AdvertiserID=${selectedAdvertiser.AdvertiserID}`,
        selectedAdvertiser,
        {
          headers: {
            "Access-Token": localStorage.getItem("accessToken"),
            "Content-Type": "application/json",
          },
        },
      );
      alert("Advertiser updated successfully");
      setIsModalOpen(false);

      const updatedAdvertisers = advertisers.map((ad) =>
        ad.AdvertiserID === selectedAdvertiser.AdvertiserID
          ? selectedAdvertiser
          : ad,
      );
      setAdvertisers(updatedAdvertisers);
    } catch (error) {
      console.error("Error actualizando el advertiser:", error);
      alert("Error updating advertiser");
    }
  };

  const handleOpenCreateContactModal = (advertiserID: number) => {
    setCurrentContact({
      ContactID: 0,
      SupplierID: 0,
      AdvertiserID: advertiserID,
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

  const handleOpenEditContactModal = (contact: any) => {
    const contactType = arrayContactTypes.find(
      (type) => type.TypeID === contact.ContactTypeID,
    );

    setCurrentContact({
      ContactID: contact.ContactID,
      SupplierID: contact.SupplierID || 0,
      AdvertiserID: contact.AdvertiserID || selectedAdvertiserID,
      ContactTypeID: contact.ContactTypeID || "",
      Name: contact.Name || "",
      JobDescription: contact.JobDescription || "",
      Phone: contact.Phone || "",
      EMail: contact.EMail || "",
      SkypeID: contact.SkypeID || "",
      HaveUserAccessConnect: contact.HaveUserAccessConnect || 0,
      StatusID: contact.StatusID || "A",
      ContactType: contactType
        ? contactType.Description
        : contact.ContactType || "",
    });
    setIsEditingContact(true);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async () => {
    try {
      if (isEditingContact) {
        await saveOrUpdateContact("PUT", currentContact);
        alert("Contact updated successfully");
      } else {
        await saveOrUpdateContact("POST", currentContact);
        alert("Contact created successfully");
      }

      const updatedContacts = await getContacts(currentContact.AdvertiserID);
      setContacts(updatedContacts.result || []);
      setIsContactModalOpen(false);
    } catch (error) {
      console.error(
        isEditingContact
          ? "Error al actualizar el contacto:"
          : "Error al crear el contacto:",
        error,
      );
      alert(
        isEditingContact
          ? "Error updating contact"
          : "Error creating contact",
      );
    }
  };

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

  const isFormValid =
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword &&
    passwordRequirements.minLength &&
    passwordRequirements.uppercase &&
    passwordRequirements.specialChar;

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


  const handleAdvertiserSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setAdvertiserSearch(value);

  if (value.length > 0) {
    setShowAdvertiserSuggestions(true);
  } else {
    setShowAdvertiserSuggestions(false);
  }
};

const handleAdvertiserFocus = () => {
  setShowAdvertiserSuggestions(true);
};

const handleAdvertiserBlur = () => {
  setTimeout(() => {
    setShowAdvertiserSuggestions(false);
  }, 200); // delay para permitir el click
};

const selectAdvertiser = (advertiser: Advertiser) => {
  setAdvertiserSearch(advertiser.Advertiser);
  setShowAdvertiserSuggestions(false);
};

const handleManagerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setManagerSearch(value);
  setShowManagerSuggestions(value.length > 0);
};

const handleManagerFocus = () => {
  setShowManagerSuggestions(true);
};

const handleManagerBlur = () => {
  setTimeout(() => setShowManagerSuggestions(false), 200);
};

const selectManager = (manager: Manager) => {
  setManagerSearch(manager.AccountManager);
  setShowManagerSuggestions(false);
};

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, boxShadow: 1, color: theme.palette.text.primary }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: theme.palette.text.primary }}>Advertisers</h1>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2, bgcolor: 'background.paper', p: 2, borderRadius: 1, color: theme.palette.text.primary }}>
        <Box>
          <Box sx={{ position: 'relative' }}>
  <Input
  fullWidth
  disableUnderline={false}
  placeholder="Search advertisers..."
  value={advertiserSearch}
  onChange={handleAdvertiserSearchChange}
  onFocus={handleAdvertiserFocus}
  onBlur={handleAdvertiserBlur}
  sx={{
    fontSize: '1rem',
    color: theme.palette.text.primary,
    '&::placeholder': {
      color: theme.palette.text.disabled,
      opacity: 1,
    },
    borderBottom: `1px solid ${theme.palette.divider}`,
    transition: 'border-color 0.3s',
    '&:focus-within': {
      borderBottom: `2px solid ${theme.palette.primary.main}`,
    },
  }}
/>
  {showAdvertiserSuggestions && (
    <Box
      sx={{
        position: 'absolute',
        top: 55,
        left: 0,
        right: 0,
        zIndex: 10,
        maxHeight: 200,
        overflowY: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 3,
        borderRadius: 1,
      }}
    >
      {advertisers
        .filter((adv) =>
          adv.Advertiser.toLowerCase().includes(advertiserSearch.toLowerCase())
        )
        .map((adv) => (
          <Box
            key={adv.AdvertiserID}
            sx={{
              p: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => selectAdvertiser(adv)}
          >
            {adv.Advertiser}
          </Box>
        ))}
    </Box>
  )}
</Box>
        </Box>
       <Box sx={{ position: 'relative' }}>
  <Input
    fullWidth
    disableUnderline={false}
    placeholder="Search account manager"
    value={managerSearch}
    onChange={handleManagerSearchChange}
    onFocus={handleManagerFocus}
    onBlur={handleManagerBlur}
    sx={{
      fontSize: '1rem',
      color: theme.palette.text.primary,
      '&::placeholder': {
        color: theme.palette.text.disabled,
        opacity: 1,
      },
      borderBottom: `1px solid ${theme.palette.divider}`,
      transition: 'border-color 0.3s',
      '&:focus-within': {
        borderBottom: `2px solid ${theme.palette.primary.main}`,
      },
    }}
  />
  {showManagerSuggestions && (
    <Box
      sx={{
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        zIndex: 10,
        maxHeight: 200,
        overflowY: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 3,
        borderRadius: 1,
      }}
    >
      {managers
        .filter((manager) =>
          manager.AccountManager.toLowerCase().includes(managerSearch.toLowerCase())
        )
        .map((manager) => (
          <Box
            key={manager.AccountManagerID}
            sx={{
              p: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => selectManager(manager)}
          >
            {manager.AccountManager}
          </Box>
        ))}
    </Box>
  )}
</Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={handleOpenAddModal}
            variant="contained"
            color="success"
            size="medium"
            startIcon={<span>+</span>}
            sx={{
              minWidth: { xs: '100%', sm: 100 },
              height: 40,
              fontSize: '1rem',
            }}
          >
            Add
          </Button>
        </Box>
      </Box>

      {isAddModalOpen && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, maxWidth: '3xl', maxHeight: '90vh', overflowY: 'auto', boxShadow: 3, color: theme.palette.text.primary }}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center" style={{ color: theme.palette.text.primary }}>
              Add new advertiser
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Advertiser",
                "FantasyName",
                "LegalName",
                "Address",
                "Country",
                "ContactName",
                "EMail",
              ].map((field) => (
                <div key={field} className="col-span-1">
                  <TextField
                    fullWidth
                    variant="outlined"
                    label={field.replace(/([A-Z])/g, " $1").trim()}
                    type={field === "EMail" ? "email" : "text"}
                    value={newAdvertiser[field]}
                    onChange={(e) =>
                      setNewAdvertiser({
                        ...newAdvertiser,
                        [field]: e.target.value,
                      })
                    }
                    sx={{ bgcolor: 'white' }}
                  />
                </div>
              ))}
              <div className="col-span-1 md:col-span-2">
                <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'white' }}>
                  <InputLabel>Account manager</InputLabel>
                  <Select
                    value={newAdvertiser.AccountManagerID}
                    onChange={(e) =>
                      setNewAdvertiser({
                        ...newAdvertiser,
                        AccountManagerID: e.target.value,
                      })
                    }
                    label="Account manager"
                  >
                    <MenuItem value="">
                      <em>Select manager</em>
                    </MenuItem>
                    {managers.map((manager) => (
                      <MenuItem
                        key={manager.AccountManagerID}
                        value={manager.AccountManagerID}
                      >
                        {manager.AccountManager}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <Button
                onClick={() => setIsAddModalOpen(false)}
                variant="outlined"
                color="inherit"
                size="medium"
              >
                Close
              </Button>
              <Button
                onClick={handleAddAdvertiser}
                variant="contained"
                color="primary"
                size="medium"
              >
                Accept
              </Button>
            </div>
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 3, overflowX: 'auto', pb: 2 }}>
        <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left text-gray-700 font-semibold">Advertiser</th>
              <th className="border p-2 text-left text-gray-700 font-semibold">Account manager</th>
              <th className="border p-2 text-left text-gray-700 font-semibold">Campaigns</th>
              <th className="border p-2 text-left text-gray-700 font-semibold">Fantasy name</th>
              <th className="border p-2 text-left text-gray-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAdvertisers.map((ad) => (
              <tr key={ad.AdvertiserID} className="border hover:bg-gray-50 transition duration-200">
                <td className="p-2 text-gray-900">
                  {ad.Advertiser
                    ? `${ad.Advertiser} (${ad.AdvertiserID})`
                    : "N/A"}
                </td>
                <td className="p-2 text-gray-900">{getManagerName(ad.AccountManagerID)}</td>
                <td className="p-2 text-gray-900">{ad.TotalActiveCampaigns || 0}</td>
                <td className="p-2 text-gray-900">{ad.FantasyName || "N/A"}</td>
                <td className="p-2 flex gap-2">
                  <Button
                    onClick={() => handleEdit(ad)}
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
                  >
                    ✎
                  </Button>
                  <Button
                    onClick={() => handleViewContacts(ad.AdvertiserID)}
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
                  >
                    👤
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(ad)}
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
                  >
                    ✖
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      {isContactsModalOpen && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, maxWidth: 'md', boxShadow: 3, color: theme.palette.text.primary }}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4" style={{ color: theme.palette.text.primary }}>
              Contacts for advertiser
            </h2>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search"
              sx={{ mb: 2, bgcolor: 'white' }}
            />
            <Button
              onClick={() => handleOpenCreateContactModal(selectedAdvertiserID)}
              variant="contained"
              color="primary"
              size="medium"
              sx={{ mb: 2 }}
            >
              Add contact
            </Button>
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <div
                  key={contact.ContactID}
                  className="my-2 flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {contact.Name} ({contact.ContactID})
                    </h2>
                    <p className="text-gray-600">{contact.EMail}</p>
                    <span className="text-sm text-gray-500">
                      {contact.Description}
                    </span>
                  </div>
                  <div className="relative">
                    {!isChangePasswordModalOpen && (
                      <>
                        <Button
                          className="p-1 text-gray-500 hover:text-gray-700"
                          onClick={() =>
                            setSelectedAdvertiserID(
                              selectedAdvertiserID === contact.ContactID
                                ? null
                                : contact.ContactID,
                            )
                          }
                          variant="text"
                          size="small"
                          sx={{ minWidth: 0, p: 0.5 }}
                        >
                          ⋮
                        </Button>
                        {selectedAdvertiserID === contact.ContactID && (
                          <div className="absolute right-0 z-10 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <Button
                              className="block w-full px-2 py-1 text-left text-gray-700 hover:bg-gray-100"
                              onClick={() =>
                                handleOpenEditContactModal(contact)
                              }
                              variant="text"
                              size="small"
                            >
                              Edit
                            </Button>
                            {contact.HaveUserAccessConnect ? (
                              <>
                                <Button
                                  className="block w-full px-2 py-1 text-left text-gray-700 hover:bg-gray-100"
                                  onClick={() =>
                                    handleViewPassword(contact.EMail)
                                  }
                                  variant="text"
                                  size="small"
                                >
                                  View password
                                </Button>
                                <Button
                                  className="block w-full px-2 py-1 text-left text-gray-700 hover:bg-gray-100"
                                  onClick={() =>
                                    handleOpenChangePasswordModal(
                                      contact.EMail,
                                    )
                                  }
                                  variant="text"
                                  size="small"
                                >
                                  Change password
                                </Button>
                              </>
                            ) : null}
                            <Button
                              className="block w-full px-2 py-1 text-left text-red-600 hover:bg-gray-100"
                              onClick={() => handleDeleteClick(contact)}
                              variant="text"
                              size="small"
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No contacts found.</p>
            )}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setIsContactsModalOpen(false)}
                variant="outlined"
                color="inherit"
                size="medium"
              >
                Close
              </Button>
            </div>
          </Box>
        </Box>
      )}

      {isDeleteModalOpen && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, maxWidth: 'md', boxShadow: 3, color: theme.palette.text.primary }}>
            <h2 className="mb-2 text-lg font-semibold" style={{ color: theme.palette.text.primary }}>Do you want to delete this {itemToDelete?.ContactID ? "contact" : "advertiser"}?</h2>
            <div className="flex justify-end space-x-4">
              <Button
                onClick={handleConfirmDelete}
                variant="contained"
                color="error"
                size="medium"
              >
                Delete
              </Button>
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                variant="outlined"
                color="inherit"
                size="medium"
              >
                Cancel
              </Button>
            </div>
          </Box>
        </Box>
      )}

      {isPasswordModalOpen && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, maxWidth: 'md', boxShadow: 3, color: theme.palette.text.primary }}>
            <h2 className="mb-2 text-lg font-bold" style={{ color: theme.palette.text.primary }}>Current password:</h2>
            <div className="relative">
              <TextField
  fullWidth
  variant="outlined"
  value={password}
  InputProps={{ readOnly: true }}
  sx={{ textAlign: 'center', bgcolor: 'white' }}
/>
              <Button
                className={`absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 ${isCopied ? "text-green-500" : ""}`}
                onClick={handleCopyPassword}
                variant="text"
                size="small"
                sx={{ minWidth: 0, p: 0.5 }}
              >
                {isCopied ? <CheckIcon className="h-5 w-5" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
              </Button>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setIsPasswordModalOpen(false)}
                variant="outlined"
                color="inherit"
                size="medium"
              >
                Close
              </Button>
            </div>
          </Box>
        </Box>
      )}

      {isChangePasswordModalOpen && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, maxWidth: 'md', boxShadow: 3, color: theme.palette.text.primary }}>
            <h2 className="mb-2 text-lg font-bold" style={{ color: theme.palette.text.primary }}>Change password</h2>
            {passwordUpdateMessage && (
              <div className="mb-2 bg-green-100 text-green-700 p-2 rounded">
                {passwordUpdateMessage}
              </div>
            )}
            <div className="space-y-4">
              <div className="relative">
                <TextField
                  fullWidth
                  variant="outlined"
                  label={<><span style={{ color: 'red' }}>*</span> Password</>}
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                />
                <Button
                  type="button"
                  className="absolute right-2 top-10 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  variant="text"
                  size="small"
                  sx={{ minWidth: 0, p: 0.5 }}
                >
                  {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </Button>
                <div className="mt-2 bg-gray-50 p-2 rounded">
                  <p className="text-sm font-medium text-gray-700">Password requirements:</p>
                  <ul className="text-sm space-y-1">
                    <li className={passwordRequirements.minLength ? "text-green-500" : "text-red-500"}>
                      {passwordRequirements.minLength ? "✔" : "✘"} At least 6 characters
                    </li>
                    <li className={passwordRequirements.uppercase ? "text-green-500" : "text-red-500"}>
                      {passwordRequirements.uppercase ? "✔" : "✘"} At least one uppercase letter
                    </li>
                    <li className={passwordRequirements.specialChar ? "text-green-500" : "text-red-500"}>
                      {passwordRequirements.specialChar ? "✔" : "✘"} At least one special character
                    </li>
                  </ul>
                </div>
              </div>
              <div className="relative">
                <TextField
                  fullWidth
                  variant="outlined"
                  label={<><span style={{ color: 'red' }}>*</span> Confirm password</>}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                />
                <Button
                  type="button"
                  className="absolute right-2 top-10 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  variant="text"
                  size="small"
                  sx={{ minWidth: 0, p: 0.5 }}
                >
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </Button>
                {passwordMismatchError && (
                  <p className="mt-1 text-sm text-red-500">{passwordMismatchError}</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <Button
                onClick={handleCloseChangePasswordModal}
                variant="outlined"
                color="inherit"
                size="medium"
              >
                Close
              </Button>
              {isFormValid && (
                <Button
                  onClick={handleChangePassword}
                  variant="contained"
                  color="primary"
                  size="medium"
                >
                  Update password
                </Button>
              )}
            </div>
          </Box>
        </Box>
      )}

      <div className="mt-4 flex items-center justify-center gap-2">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          variant="contained"
          size="small"
          sx={{ minWidth: 0, p: 0.5 }}
        >
          Prev
        </Button>
        <span className="text-gray-800 font-medium" style={{ color: theme.palette.text.primary }}>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          variant="contained"
          size="small"
          sx={{ minWidth: 0, p: 0.5 }}
        >
          Next
        </Button>
      </div>

      {isModalOpen && selectedAdvertiser && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, maxWidth: '3xl', maxHeight: '90vh', overflowY: 'auto', boxShadow: 3, color: theme.palette.text.primary }}>
            <h2 className="w-full border-b border-gray-300 pb-2 text-center text-xl font-semibold text-gray-800" style={{ color: theme.palette.text.primary }}>
              Edit: {selectedAdvertiser?.Advertiser || "Unknown"}
            </h2>
            <div className="space-y-4">
              <div>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Advertiser"
                  value={selectedAdvertiser?.Advertiser || ""}
                  onChange={(e) =>
                    setSelectedAdvertiser({
                      ...selectedAdvertiser,
                      Advertiser: e.target.value,
                    })
                  }
                  sx={{ bgcolor: 'white' }}
                />
              </div>
              <div>
                <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'white' }}>
                  <InputLabel>Account manager</InputLabel>
                  <Select
                    value={selectedAdvertiser?.AccountManagerID || ""}
                    onChange={(e) =>
                      setSelectedAdvertiser({
                        ...selectedAdvertiser,
                        AccountManagerID: Number(e.target.value),
                      })
                    }
                    label="Account manager"
                  >
                    {managers.map((manager) => (
                      <MenuItem
                        key={manager.AccountManagerID}
                        value={manager.AccountManagerID}
                      >
                        {manager.AccountManager}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              {[
                "FantasyName",
                "LegalName",
                "Address",
                "Country",
                "ContactName",
                "EMail",
              ].map((field) => (
                <div key={field}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label={field.replace(/([A-Z])/g, " $1").trim()}
                    type={field === "EMail" ? "email" : "text"}
                    value={selectedAdvertiser?.[field] || ""}
                    onChange={(e) =>
                      setSelectedAdvertiser({
                        ...selectedAdvertiser,
                        [field]: e.target.value,
                      })
                    }
                    sx={{ bgcolor: 'white' }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="outlined"
                color="inherit"
                size="medium"
              >
                Close
              </Button>
              <Button
                onClick={handleSaveAdvertiser}
                variant="contained"
                color="primary"
                size="medium"
              >
                Save
              </Button>
            </div>
          </Box>
        </Box>
      )}

      {isContactModalOpen && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, maxWidth: { xs: '90%', sm: 'md' }, maxHeight: '90vh', overflowY: 'auto', boxShadow: 3, color: theme.palette.text.primary }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: theme.palette.text.primary }}>
              {isEditingContact ? "Edit contact" : "Create new contact"}
            </h2>
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
                  setCurrentContact({
                    ...currentContact,
                    Name: e.target.value,
                  })
                }
                sx={{ bgcolor: 'white' }}
              />
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'white' }}>
                  <InputLabel>Contact type</InputLabel>
                  <Select
                    value={currentContact.ContactTypeID}
                    onChange={(e) => {
                      const selectedType = arrayContactTypes.find(
                        (type) => type.TypeID === e.target.value,
                      );
                      setCurrentContact({
                        ...currentContact,
                        ContactTypeID: e.target.value,
                        ContactType: selectedType
                          ? selectedType.Description
                          : "",
                      });
                    }}
                    label="Contact type"
                  >
                    <MenuItem value="">
                      <em>Select contact type</em>
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
                    setCurrentContact({
                      ...currentContact,
                      Phone: e.target.value,
                    })
                  }
                  sx={{ bgcolor: 'white' }}
                />
              </Box>
              <TextField
                fullWidth
                variant="outlined"
                label="E-mail"
                type="email"
                value={currentContact.EMail}
                onChange={(e) =>
                  setCurrentContact({
                    ...currentContact,
                    EMail: e.target.value,
                  })
                }
                sx={{ bgcolor: 'white' }}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Job description"
                value={currentContact.JobDescription}
                onChange={(e) =>
                  setCurrentContact({
                    ...currentContact,
                    JobDescription: e.target.value,
                  })
                }
                sx={{ bgcolor: 'white' }}
              />
              <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'white' }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentContact.StatusID}
                  onChange={(e) =>
                    setCurrentContact({
                      ...currentContact,
                      StatusID: e.target.value,
                    })
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
                  setCurrentContact({
                    ...currentContact,
                    SkypeID: e.target.value,
                  })
                }
                sx={{ bgcolor: 'white' }}
              />
            </Box>
            <div className="mt-4 flex justify-end space-x-4">
              <Button
                onClick={() => setIsContactModalOpen(false)}
                variant="outlined"
                color="inherit"
                size="medium"
              >
                Close
              </Button>
              <Button
                onClick={handleSaveContact}
                variant="contained"
                color="primary"
                size="medium"
              >
                Accept
              </Button>
            </div>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default ShowAdvertiser;