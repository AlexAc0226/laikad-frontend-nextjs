import apiClient from '@/libs/axiosConfig';

export const saveOrUpdateContact = async (action: string, currentContact: any) => {
    if (action.toUpperCase() === 'PUT') {
       const infoUpdate = await apiClient.put(`/contacts?ContactID=${currentContact.ContactID}`, currentContact,
            {
              headers: {
                "Access-Token": localStorage.getItem("accessToken"),
                "Content-Type": "application/json",
              },
            },
          );
          return infoUpdate.data;
    } else {
        const infoPost = await apiClient.post("/contacts", currentContact,
            {
              headers: {
                "Access-Token": localStorage.getItem("accessToken"),
                "Content-Type": "application/json",
              },
            },
          );
          return infoPost.data;
    }
};

export const deleteContact = async(contactID: number) => {
    const infoDelete = await apiClient.delete(`/contacts?ContactID=${contactID}`,
            {
              headers: {
                "Access-Token": localStorage.getItem("accessToken"),
                "Content-Type": "application/json",
              },
            },
          );
          return infoDelete.data;
};
