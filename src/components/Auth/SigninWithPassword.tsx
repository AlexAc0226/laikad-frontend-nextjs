"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { authenticateUser } from "./auth";

export default function SigninWithPassword() {
  const [data, setData] = useState({
    email: process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "",
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASS || "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data.email) {
      return toast.error("Please enter your email address.");
    }

    setLoading(true);

    try {
      const isAuthenticated = await authenticateUser(data);
      if (isAuthenticated) {
        toast.success("Logged in successfully");
        setData({ email: "", password: "", remember: false });
        router.push("/");
      } else {
        toast.error("Authentication failed");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-gray-900 rounded-xl shadow-lg">
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-200 mb-2">Email</label>
        <div className="relative">
          <input
            type="email"
            placeholder="Enter your email"
            value={data.email}
            name="email"
            onChange={handleChange ? (e) => handleChange(e) : undefined}
            className="w-full px-4 py-3 bg-gray-800 text-gray-200 rounded-lg border border-gray-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/50 outline-none transition-all duration-300 placeholder-gray-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <svg
              width="20"
              height="20"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.11756 2.979H12.8877C14.5723 2.97899 15.9066 2.97898 16.9509 3.11938C18.0256 3.26387 18.8955 3.56831 19.5815 4.25431C20.2675 4.94031 20.5719 5.81018 20.7164 6.8849C20.8568 7.92918 20.8568 9.26351 20.8568 10.9481V11.0515C20.8568 12.7362 20.8568 14.0705 20.7164 15.1148C20.5719 16.1895 20.2675 17.0594 19.5815 17.7454C18.8955 18.4314 18.0256 18.7358 16.9509 18.8803C15.9066 19.0207 14.5723 19.0207 12.8876 19.0207H9.11756C7.43295 19.0207 6.09861 19.0207 5.05433 18.8803C3.97961 18.7358 3.10974 18.4314 2.42374 17.7454C1.73774 17.0594 1.4333 16.1895 1.28881 15.1148C1.14841 14.0705 1.14842 12.7362 1.14844 11.0516V10.9481C1.14842 9.26351 1.14841 7.92918 1.28881 6.8849C1.4333 5.81018 1.73774 4.94031 2.42374 4.25431C3.10974 3.56831 3.97961 3.26387 5.05433 3.11938C6.09861 2.97898 7.43294 2.97899 9.11756 2.979ZM5.23755 4.48212C4.3153 4.60611 3.78396 4.83864 3.39602 5.22658C3.00807 5.61452 2.77554 6.14587 2.65155 7.06812C2.5249 8.01014 2.52344 9.25192 2.52344 10.9998C2.52344 12.7478 2.5249 13.9895 2.65155 14.9316C2.77554 15.8538 3.00807 16.3852 3.39602 16.7731C3.78396 17.161 4.3153 17.3936 5.23755 17.5176C6.17957 17.6442 7.42135 17.6457 9.16927 17.6457H12.8359C14.5839 17.6457 15.8256 17.6442 16.7677 17.5176C17.6899 17.3936 18.2213 17.161 18.6092 16.7731C18.9971 16.3852 19.2297 15.8538 19.3537 14.9316C19.4803 13.9895 19.4818 12.7478 19.4818 10.9998C19.4818 9.25192 19.4803 8.01014 19.3537 7.06812C19.2297 6.14587 18.9971 5.61452 18.6092 5.22658C18.2213 4.83864 17.6899 4.60611 16.7677 4.48212C15.8256 4.35546 14.5839 4.354 12.8359 4.354H9.16927C7.42135 4.354 6.17958 4.35546 5.23755 4.48212ZM4.97445 6.89304C5.21753 6.60135 5.65104 6.56194 5.94273 6.80502L7.92172 8.45418C8.77693 9.16685 9.37069 9.66005 9.87197 9.98246C10.3572 10.2945 10.6863 10.3993 11.0026 10.3993C11.3189 10.3993 11.648 10.2945 12.1332 9.98246C12.6345 9.66005 13.2283 9.16685 14.0835 8.45417L16.0625 6.80502C16.3542 6.56194 16.7877 6.60135 17.0308 6.89304C17.2738 7.18473 17.2344 7.61825 16.9427 7.86132L14.9293 9.5392C14.1168 10.2163 13.4582 10.7651 12.877 11.1389C12.2716 11.5283 11.6819 11.7743 11.0026 11.7743C10.3233 11.7743 9.73364 11.5283 9.12818 11.1389C8.54696 10.7651 7.88843 10.2163 7.07594 9.5392L5.06248 7.86132C4.77079 7.61825 4.73138 7.18473 4.97445 6.89304Z"
                fill=""
              />
            </svg>
          </span>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-2">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={data.password}
            placeholder="Enter your password"
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800 text-gray-200 rounded-lg border border-gray-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/50 outline-none transition-all duration-300 placeholder-gray-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-300"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.049 10.049 0 012.923-4.362M6.364 6.364A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.051 10.051 0 01-4.296 5.072M6.364 6.364l11.314 11.314M6.364 6.364L4.222 4.222M17.657 17.657l2.121 2.121" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <label className="flex items-center text-sm text-gray-200 cursor-pointer">
          <input
            type="checkbox"
            name="remember"
            id="remember"
            className="sr-only peer"
            onChange={(e) =>
              setData({
                ...data,
                remember: e.target.checked,
              })
            }
          />
          <span className="w-5 h-5 flex items-center justify-center mr-2 border-2 border-gray-700 rounded bg-gray-800 peer-checked:border-blue-600 peer-checked:bg-blue-600">
            <svg className="w-4 h-4 text-white hidden peer-checked:block" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
          Remember me
        </label>
        <Link href="/auth/forgot-password" className="text-sm text-blue-400 hover:text-blue-600 transition-colors duration-300">
          Forgot Password?
        </Link>
      </div>

      <div className="mb-4">
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md focus:ring-2 focus:ring-blue-500/50"
          disabled={loading}
        >
          Sign In
          {loading && (
            <span className="inline-block w-4 h-4 ml-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
        </button>
      </div>
    </form>
  );
}