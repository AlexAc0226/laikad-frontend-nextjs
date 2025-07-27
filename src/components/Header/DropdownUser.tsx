import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ClickOutside from "@/components/ClickOutside";
import { signOut } from "next-auth/react";

const DropdownUser = () => {
  return <DropdownUserContent />;
};

const DropdownUserContent = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState('/images/user/user-03.png');

useEffect(() => {
  const userData = localStorage.getItem('user');
  
  if (userData) {
    const parsed = JSON.parse(userData);
    setUserName(parsed?.Name || parsed?.EMail || 'Invitado');
    if (parsed?.Image) {
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  const imageUrl = parsed.Image.startsWith("http")
    ? parsed.Image
    : `${baseUrl}/${parsed.Image}`;

  setUserImage(imageUrl || "/images/user/user-03.png");
}
  }
}, []);

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    setDropdownOpen(false);
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        href="#"
      >
        
        <span className="flex items-center gap-2 font-medium text-dark dark:text-dark-6">
          <span className="hidden lg:block">
            {userName}
          </span>
        </span>
      </Link>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow">
          <button
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;
