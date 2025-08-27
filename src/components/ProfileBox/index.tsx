"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { getSignedURL } from "@/actions/upload";
import apiClient from "@/libs/axiosConfig";

type ProfileState = {
  name: string;
  email: string;
  phone: string;
  profilePhoto: string;
  coverPhoto: string;
};

const ProfileBox = () => {
  const { data: session, update } = useSession();

  const profilePic =
    session?.user?.image
      ? session.user.image.includes("http")
        ? (session.user.image as string)
        : `${process.env.NEXT_PUBLIC_IMAGE_URL}/${session.user.image}`
      : "/images/user/user-03.png";

  const coverPic =
    // @ts-ignore
    session?.user?.coverImage
      // @ts-ignore
      ? session.user.coverImage.includes("http")
        // @ts-ignore
        ? (session.user.coverImage as string)
        // @ts-ignore
        : `${process.env.NEXT_PUBLIC_COVER_IMAGE_URL}/${session.user.coverImage}`
      : "/images/cover/cover-01.png";

  const [data, setData] = useState<ProfileState>({
    name: (session?.user?.name as string) || "",
    email: session?.user?.email || "",
    phone: "",
    profilePhoto: profilePic,
    coverPhoto: coverPic,
  });

  const [advertiserId, setAdvertiserId] = useState<number | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);

  const [file, setFile] = useState<File>();
  const [loading, setLoading] = useState(false);
  const isDemo = session?.user?.email?.includes("demo-");

  // --- Helpers ---
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  // 1) En el mount: primero /auth (fuente de verdad). Si falla, usamos token.
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("accessToken") || "";

      // A) Intentar /auth primero
      try {
        if (token) {
          const res = await apiClient.get("/auth", {
            headers: {
              "Access-Token": token,
              Authorization: `Bearer ${token}`,
            },
          });

          const u = res?.data?.result;
          if (u) {
            const name = (u.Name ?? u.name ?? "").toString().trim();
            const email = (u.EMail ?? u.email ?? u.Logon ?? "").toString().trim();

            setData((prev) => ({
              ...prev,
              name: name || prev.name,
              email: email || prev.email,
            }));

            setAdvertiserId(u.AdvertiserID ?? null);
            setRoleId(u.RoleID ?? null);

            if (session?.user) {
              await update({
                ...session,
                user: {
                  ...session.user,
                  name: name || session.user.name,
                  email: email || (session.user.email as string),
                  image: session.user.image,
                },
              });
            }

            // Ya lo obtuvimos desde /auth, terminamos.
            return;
          }
        }
      } catch (e) {
        // seguimos al plan B (token)
        console.warn("Fallo /auth, se intenta token:", e);
      }

      // B) Fallback: intentar leer del token si /auth no se pudo usar
      try {
        if (!token) return;
        const payload = parseJwt(token);
        if (!payload) return;

        const name = (payload.Name ?? payload.name ?? "").toString().trim();
        const email = (
          payload.EMail ?? payload.email ?? payload.Logon ?? ""
        ).toString();

        setData((prev) => ({
          ...prev,
          name: name || prev.name,
          email: email || prev.email,
        }));

        const advId: number | null =
          payload.AdvertiserID ?? payload.advertiserId ?? null;
        const rId: number | null = payload.RoleID ?? payload.roleId ?? null;

        setAdvertiserId(typeof advId === "number" ? advId : null);
        setRoleId(typeof rId === "number" ? rId : null);

        if (session?.user && (name || email)) {
          await update({
            ...session,
            user: {
              ...session.user,
              name: name || session.user.name,
              email: email || (session.user.email as string),
            },
          });
        }
      } catch (err) {
        console.error("Error leyendo token:", err);
        toast.error("No se pudo leer tu sesión");
      }
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) (Opcional) Completar Phone desde /contacts
  useEffect(() => {
    const loadContact = async () => {
      try {
        if (!advertiserId) return;
        const isAdvertiserRole = roleId === 9 || roleId === 1;
        if (!isAdvertiserRole) return;

        const token = localStorage.getItem("accessToken") || "";
        const res = await apiClient.get(
          `/contacts?SupplierID=0&AdvertiserID=${advertiserId}`,
          {
            headers: {
              "Access-Token": token,
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const list: any[] = res?.data?.result || [];
        const contact = list.find((c) => c?.EMail) || list[0];
        if (!contact) return;

        setData((prev) => ({
          ...prev,
          phone: contact?.Phone || prev.phone,
        }));
      } catch (e) {
        console.error("Error cargando contacts:", e);
      }
    };

    loadContact();
  }, [advertiserId, roleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files, value } = e.target;
    if (name === "profilePhoto" || name === "coverPhoto") {
      const f = files?.[0];
      if (!f) return;
      setFile(f);
      setData((prev) => ({ ...prev, [name]: URL.createObjectURL(f) }));
      return;
    }
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return null;
    const signedUrl = await getSignedURL(file.type, file.size);

    if (signedUrl.failure !== undefined) {
      toast.error(signedUrl.failure);
      setFile(undefined);
      setData((prev) => ({ ...prev, profilePhoto: "", coverPhoto: "" }));
      return null;
    }

    const url = signedUrl.success.url;
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (res.status === 200) return signedUrl.success.key;
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      toast.error("Failed to upload profile photo");
    }
    return null;
  };

  const updateUserProfile = async (
    data: ProfileState,
    uploadedImageUrl: string | null,
    uploadedCoverImageUrl: string | null
  ) => {
    try {
      const requestBody: any = {
        name: data.name,
        email: data.email,
        image: "",
        coverImage: "",
      };

      if (uploadedImageUrl) requestBody.image = uploadedImageUrl;
      if (uploadedCoverImageUrl) requestBody.coverImage = uploadedCoverImageUrl;

      const res = await fetch("/api/user/update", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      });

      const updatedUser = await res.json();

      if (res.status === 200) {
        toast.success("Profile updated successfully");
        setLoading(false);
        return updatedUser;
      } else if (res.status === 401) {
        setLoading(false);
        toast.error("Can't update demo user");
      } else {
        setLoading(false);
        toast.error("Failed to update profile");
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data || "Error updating profile");
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isDemo) {
      toast.error("Can't update demo user");
      setData({ name: "", email: "", phone: "", profilePhoto: "", coverPhoto: "" });
      return;
    }
    const uploadedImageUrl = await handleFileUpload(file);
    const uploadedCoverImageUrl = await handleFileUpload(file);
    setLoading(true);

    const updatedUser = await updateUserProfile(
      data,
      uploadedImageUrl,
      uploadedCoverImageUrl
    );

    if (updatedUser) {
      await update({
        ...session,
        user: {
          ...session?.user,
          name: updatedUser.name,
          email: updatedUser.email,
          image: updatedUser.image,
          coverImage: updatedUser.coverImage,
        },
      });

      setData({ name: "", email: "", phone: "", profilePhoto: "", coverPhoto: "" });
      window.location.reload();
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="relative z-20 h-35 md:h-65">
          <Image
            src={data.coverPhoto}
            alt="profile cover"
            className="h-full w-full rounded-tl-[10px] rounded-tr-[10px] object-cover object-center"
            width={970}
            height={260}
            style={{ width: "auto", height: "auto" }}
          />
          <div className="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
            <label
              htmlFor="coverPhoto"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-[3px] bg-primary px-[15px] py-[5px] text-body-sm font-medium text-white hover:bg-opacity-90"
            >
              <input
                type="file"
                name="coverPhoto"
                id="coverPhoto"
                className="sr-only"
                onChange={handleChange}
                accept="image/png, image/jpg, image/jpeg"
              />
              <span>
                <svg
                  className="fill-current"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.69882 3.365C5.89894 2.38259 6.77316 1.6875 7.77475 1.6875H10.2252C11.2268 1.6875 12.1011 2.38259 12.3012 3.36499C12.3474 3.59178 12.5528 3.75814 12.7665 3.75814H12.7788L12.7911 3.75868C13.8437 3.80471 14.6521 3.93387 15.3271 4.37668C15.7524 4.65568 16.1182 5.01463 16.4033 5.43348C16.7579 5.9546 16.9143 6.55271 16.9893 7.27609C17.0625 7.98284 17.0625 8.86875 17.0625 9.99079V10.0547C17.0625 11.1767 17.0625 12.0626 16.9893 12.7694C16.9143 13.4927 16.7579 14.0909 16.4033 14.612C16.1182 15.0308 15.7524 15.3898 15.3271 15.6688C14.7995 16.0149 14.1947 16.1675 13.461 16.2408C12.7428 16.3125 11.8418 16.3125 10.6976 16.3125H7.30242C6.15824 16.3125 5.25725 16.3125 4.53897 16.2408C3.80534 16.1675 3.20049 16.0149 2.67289 15.6688C2.24761 15.3898 1.88179 15.0308 1.59674 14.612C1.24209 14.0909 1.08567 13.4927 1.01072 12.7694C0.937488 12.0626 0.937494 11.1767 0.9375 10.0547V9.9908C0.937494 8.86875 0.937488 7.98284 1.01072 7.27609C1.08567 6.55271 1.24209 5.9546 1.59674 5.43348C1.88179 5.01463 2.24761 4.65568 2.67289 4.37668C3.34787 3.93387 4.15635 3.80471 5.20892 3.75868L5.2212 3.75814H5.2335C5.44716 3.75814 5.65262 3.59179 5.69882 3.365ZM7.77475 2.8125C7.29392 2.8125 6.89179 3.14475 6.80118 3.58955C6.65443 4.30994 6.01575 4.8764 5.24725 4.88308C4.23579 4.92802 3.69402 5.05227 3.28998 5.31733C2.98732 5.51589 2.72814 5.77058 2.52679 6.06643C2.31968 6.37076 2.19522 6.75994 2.12973 7.39203C2.06321 8.03405 2.0625 8.8617 2.0625 10.0227C2.0625 11.1838 2.06321 12.0114 2.12973 12.6534C2.19522 13.2855 2.31968 13.6747 2.5268 13.979C2.72814 14.2749 2.98732 14.5296 3.28998 14.7281C3.60313 14.9336 4.00383 15.0567 4.65078 15.1213C5.30662 15.1868 6.15145 15.1875 7.33333 15.1875H10.6667C11.8486 15.1875 12.6934 15.1868 13.3492 15.1213C13.9962 15.0567 14.3969 14.9336 14.71 14.7281C15.0127 14.5296 15.2719 14.2749 15.4732 13.979C15.6803 13.6747 15.8048 13.2855 15.8703 12.6534C15.9368 12.0114 15.9375 11.1838 15.9375 10.0227C15.9375 8.8617 15.9368 8.03405 15.8703 7.39203C15.8048 6.75994 15.6803 6.37076 15.4732 6.06643C15.2719 5.77058 15.0127 5.51589 14.71 5.31733C14.306 5.05227 13.7642 4.92802 12.7528 4.88308C11.9843 4.8764 11.3456 4.30994 11.1988 3.58955C11.1082 3.14475 10.7061 2.8125 10.2252 2.8125H7.77475Z"
                  />
                </svg>
              </span>
              <span>Edit</span>
            </label>
          </div>
        </div>

        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="mt-4">
           

            <div className="mt-2 text-sm text-dark dark:text-white/80">
              
              <p><strong>Email:</strong> {data.email || "—"}</p>
              
            </div>

            
            
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileBox;
