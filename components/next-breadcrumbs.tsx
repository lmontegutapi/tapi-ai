"use client";

import React, { ReactNode } from "react";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type TBreadCrumbProps = {
  homeElement: ReactNode;
  capitalizeLinks?: boolean;
};

const NextBreadcrumb = ({ homeElement, capitalizeLinks }: TBreadCrumbProps) => {
  const paths = usePathname();
  const pathNames = paths.split("/").filter((path) => path);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths === "/dashboard" ? (
          <BreadcrumbItem>
            <BreadcrumbPage>{homeElement}</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem>
            <Link href="/dashboard">{homeElement}</Link>
          </BreadcrumbItem>
        )}

        {pathNames.map((link, index) => {
          if (link === "dashboard") return null;
          
          const href = `/${pathNames.slice(0, index + 1).join("/")}`;
          const itemLink = capitalizeLinks
            ? link[0].toUpperCase() + link.slice(1, link.length)
            : link;

          return (
            <React.Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === pathNames.length - 1 ? (
                  <BreadcrumbPage>{itemLink}</BreadcrumbPage>
                ) : (
                  <Link href={href}>{itemLink}</Link>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default NextBreadcrumb;
