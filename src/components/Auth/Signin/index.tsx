"use client";
import Link from "next/link";
import React, { useState } from "react";
import GoogleSigninButton from "../GoogleSigninButton";
import SigninWithPassword from "../SigninWithPassword";
import ProtectedLayout from "../ProtectedLayout";

export default function Signin() {
  return (
    <>
      <ProtectedLayout>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[#1E293B] px-3 text-gray-300">Sign in with email</span>
          </div>
        </div>
        <div>
          <SigninWithPassword />
        </div>
      </ProtectedLayout>
    </>
  );
}
