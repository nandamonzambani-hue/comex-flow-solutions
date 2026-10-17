/**
 * Menu do painel administrativo, agrupado como no painel da inChurch
 * (Igreja, Pessoas, Cuidado, Programação, Conteúdo, Formulários,
 * Financeiro). Usado pela barra lateral (tablet/web) e pela grade da tela
 * inicial do admin (celular).
 */
export interface AdminNavItem {
  icon: string;
  key: string;
  href: string;
  /** Só admin/pároco (não a equipe comum). */
  adminOnly?: boolean;
}

export interface AdminNavSection {
  key: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavSection[] = [
  {
    key: "admin.nav.church",
    items: [
      { icon: "home", key: "admin.dashboard.title", href: "/admin" },
      { icon: "git-network", key: "admin.communities.title", href: "/admin/communities" },
      { icon: "card", key: "admin.subscription.title", href: "/admin/subscription", adminOnly: true },
    ],
  },
  {
    key: "admin.nav.people",
    items: [{ icon: "people", key: "admin.members.title", href: "/admin/members" }],
  },
  {
    key: "admin.nav.care",
    items: [
      { icon: "hand-left", key: "admin.prayerRequests.title", href: "/admin/prayer-requests" },
      { icon: "chatbubble-ellipses", key: "admin.testimonies.title", href: "/admin/testimonies" },
    ],
  },
  {
    key: "admin.nav.schedule",
    items: [{ icon: "calendar", key: "admin.events.title", href: "/admin/events" }],
  },
  {
    key: "admin.nav.content",
    items: [
      { icon: "newspaper", key: "admin.content.title", href: "/admin/content" },
      { icon: "megaphone", key: "admin.announcements.title", href: "/admin/announcements" },
      { icon: "images", key: "admin.banners.title", href: "/admin/banners" },
      { icon: "notifications", key: "admin.notifications.title", href: "/admin/notifications" },
      { icon: "sunny", key: "admin.liturgyEditor.title", href: "/admin/liturgy-editor" },
    ],
  },
  {
    key: "admin.nav.forms",
    items: [
      { icon: "document-text", key: "admin.forms.title", href: "/admin/forms" },
      { icon: "help-circle", key: "admin.quizzes.title", href: "/admin/quizzes" },
    ],
  },
  {
    key: "admin.nav.finance",
    items: [{ icon: "cash", key: "admin.finance.title", href: "/admin/finance" }],
  },
];
