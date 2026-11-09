import { useEffect, useState } from "react";
import { replacePersonaHash, useHashPersona } from "./lib/route";
import { Shell, type NavItem } from "./components/Shell";
import { AdminIntroductions } from "./pages/admin/AdminIntroductions";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { AdminPortfolio } from "./pages/admin/AdminPortfolio";
import { AdminShare } from "./pages/admin/AdminShare";
import { BrowsePage } from "./pages/external/BrowsePage";
import { MyReviewsPage } from "./pages/external/MyReviewsPage";
import { LoginPage } from "./pages/LoginPage";
import { MePage } from "./pages/MePage";
import { TeamFeedbackPage } from "./pages/team/TeamFeedbackPage";
import { TeamExplorePage } from "./pages/team/TeamExplorePage";
import { TeamProductPage } from "./pages/team/TeamProductPage";
import { computeStats } from "./lib/analytics";
import { feedbackItems } from "./lib/feedback";
import { ownedProduct, useStore } from "./store/StoreContext";
import type { Persona } from "./types";

const FIRST_TAB: Record<Persona, string> = { external: "browse", team: "product", admin: "overview" };

export function App() {
  const { state } = useStore();
  const [tabs, setTabs] = useState<Partial<Record<Persona, string>>>({});
  const [editNote, setEditNote] = useState<string | null>(null);
  const session = state.session;
  const hashPersona = useHashPersona();

  // A fresh sign-in or persona switch always lands on that persona's first screen (Browse for viewers).
  useEffect(() => setTabs({}), [session]);
  // Opening the bare link goes to the investor page, or to wherever the signed-in person belongs.
  useEffect(() => {
    if (!hashPersona) replacePersonaHash(session?.persona ?? "external");
  }, [hashPersona, session?.persona]);

  // Each kind of user has their own link. Opening someone else's link shows that login page.
  if (!session || (hashPersona && hashPersona !== session.persona)) return <LoginPage persona={hashPersona ?? "external"} />;
  const persona = session.persona;

  const active = tabs[persona] ?? FIRST_TAB[persona];
  const go = (key: string) => setTabs((t) => ({ ...t, [persona]: key }));
  // Saved to review later, with no feedback started yet.
  const toReview = Object.values(state.swipes).filter(
    (s) => s.direction === "right" && !state.evaluations.some((e) => e.productId === s.productId),
  ).length;
  const teamProduct = ownedProduct(state);
  const newFeedback = teamProduct
    ? feedbackItems(computeStats(teamProduct, {}, state.evaluations).evaluations).filter(
        (i) => !state.feedbackStatus[i.key],
      ).length
    : 0;
  const pendingIntros = state.connections.filter((c) => c.status === "pending").length;

  const NAV: Record<Persona, NavItem[]> = {
    external: [
      { key: "browse", label: "Browse", icon: "browse" },
      { key: "reviews", label: "My reviews", icon: "list", badge: toReview },
      { key: "me", label: "Me", icon: "user" },
    ],
    team: [
      { key: "product", label: "My product", icon: "edit" },
      { key: "feedback", label: "Feedback", icon: "inbox", badge: newFeedback },
      { key: "explore", label: "Explore", icon: "browse" },
      { key: "me", label: "Me", icon: "user" },
    ],
    admin: [
      { key: "overview", label: "Dashboard", icon: "chart" },
      { key: "portfolio", label: "Portfolio", icon: "list" },
      { key: "introductions", label: "Introductions", icon: "mail", badge: pendingIntros },
      { key: "share", label: "Share", icon: "share" },
    ],
  };

  let page;
  if (persona === "external") {
    page =
      active === "reviews" ? <MyReviewsPage /> : active === "me" ? <MePage /> : <BrowsePage onGoReviews={() => go("reviews")} />;
  } else if (persona === "team") {
    page =
      active === "feedback" ? (
        <TeamFeedbackPage
          onUpdateFrom={(note) => {
            setEditNote(note);
            go("product");
          }}
        />
      ) : active === "explore" ? (
        <TeamExplorePage />
      ) : active === "me" ? (
        <MePage />
      ) : (
        <TeamProductPage editNote={editNote} clearEditNote={() => setEditNote(null)} />
      );
  } else {
    page =
      active === "portfolio" ? <AdminPortfolio /> : active === "share" ? <AdminShare /> : active === "introductions" ? <AdminIntroductions /> : <AdminOverview onGoPortfolio={() => go("portfolio")} />;
  }

  return (
    <Shell nav={NAV[persona]} active={active} onNav={go} wide={persona === "admin"}>
      {page}
    </Shell>
  );
}
