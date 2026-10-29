import { CFCI_CONTACT } from "../../data/users";

// Listings are created by CFCI staff, so a student without one is pointed to staff.
export function NoProduct() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-card bg-surface p-8 text-center ring-1 ring-line">
      <h1 className="font-display text-2xl font-bold text-navy">No product linked to your account</h1>
      <p className="max-w-xs text-muted">
        CFCI staff set up every listing. If your team already has one, ask staff to add you.
      </p>
      <div className="rounded-xl bg-canvas px-4 py-3 text-sm">
        <p className="font-semibold">{CFCI_CONTACT.name}</p>
        <p className="select-all text-royal">{CFCI_CONTACT.email}</p>
      </div>
    </div>
  );
}
