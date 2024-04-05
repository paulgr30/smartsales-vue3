
const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("pages/auth/LoginPage.vue"),
  },
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("pages/IndexPage.vue"),
      },
      {
        path: "/admin/orders",
        name: "order",
        component: () => import("pages/orders/ListPage.vue"),
      },
      {
        path: "/admin/customers",
        name: "customer",
        component: () => import("pages/customers/ListPage.vue"),
      },
      {
        path: "/admin/identitydocuments",
        name: "identity-document",
        component: () => import("pages/identity-documents/ListPage.vue"),
      },
      {
        path: "/admin/categories",
        name: "category",
        component: () => import("pages/categories/ListPage.vue"),
      },
      {
        path: "/admin/units",
        name: "unit",
        component: () => import("pages/units/ListPage.vue"),
      },
      {
        path: "/admin/products",
        name: "product",
        component: () => import("pages/products/ListPage.vue"),
      },
      {
        path: "/admin/profile",
        name: "profile",
        component: () => import("pages/auth/ProfilePage.vue"),
      },
      {
        path: "/admin/logout",
        name: "logout",
        component: () => import("pages/auth/LogoutPage.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes
