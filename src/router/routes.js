
const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
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
