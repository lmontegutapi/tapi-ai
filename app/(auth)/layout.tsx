"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import bgLoginPage from "@/public/images/bg-login-page.png";
import { Skeleton } from "@/components/ui/skeleton";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.push("/dashboard"); // Redirect to home if already logged in
    }
  }, [session, isPending, router]);

  if (isPending) {
    return null; // Show nothing while checking auth status
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bgLoginPage.src})`,
          }}
        />
        <div className="relative z-20 flex items-center text-lg font-medium gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_238_1296)">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M100 0H0L100 100H0L100 200H200L100 100H200L100 0Z"
                fill="url(#paint0_linear_238_1296)"
              />
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_238_1296"
                x1="20.5"
                y1="16"
                x2="100"
                y2="200"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#01431D" />
                <stop offset="1" stopColor="#00EE9F" />
              </linearGradient>
              <clipPath id="clip0_238_1296">
                <rect width="200" height="200" fill="white" />
              </clipPath>
            </defs>
          </svg>
          TapFlow
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6">
          <Suspense fallback={<AuthLoadingFallback />}>
            {children}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function AuthLoadingFallback() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Skeleton className="h-10 w-full" />
    </div>
  )
}
