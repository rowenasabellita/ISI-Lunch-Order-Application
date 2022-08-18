import React from "react";

export const Sidebardata = [
  {
    title: "Dashboard",
    to: "/admin/dashboard",
    icon: <i className="bx bxs-dashboard" />,
    iconClosed: <i className="bx bx-chevron-right" />,
    iconOpened: <i className="bx bx-chevron-down" />,
  },
  {
    title: "Add Supplier",
    icon: <i className="bx bxs-user-account" />,
    to: "/admin/addsupplier",
  },
  {
    title: "Add Dish",
    icon: <i className="bx bxs-dish" />,
    to: "/admin/addmenu",
  },

  {
    title: "Order Summary",
    icon: <i className="bx bxs-cart" />,
    to: "/admin/ordersummary",
  },
  {
    title: "Weekly Report",
    icon: <i className="bx bxs-notepad" />,
    to: "/admin/weeklyreport",
  },
  {
    title: "User Management",
    icon: <i className="bx bxs-user-account" />,
    to: "/admin/usermanagement",
  },
  {
    title: "Archive",
    icon: <i className="bx bxs-archive" />,
    to: "",
  },
];
