import { useAuth } from "../../context/AuthContext";
import { CategoryChip } from "../../components/CategoryChip";
import { PROVIDER_LABELS } from "../../lib/constants";

export function MyInfoTab() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface rounded-card space-y-3 p-5 shadow-sm">
        <div>
          <p className="text-ink text-lg font-semibold">{user.name}</p>
          <p className="text-muted text-sm">{user.email}</p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted">Signed in with</dt>
            <dd className="text-ink font-medium">{PROVIDER_LABELS[user.auth_provider]}</dd>
          </div>
          <div>
            <dt className="text-muted">Role</dt>
            <dd className="text-ink font-medium capitalize">{user.role}</dd>
          </div>
        </dl>
        <div>
          <p className="text-muted mb-2 text-sm">Interested directions</p>
          {user.interested_directions.length === 0 ? (
            <p className="text-muted text-sm italic">None set — browse everything.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.interested_directions.map((d) => (
                <CategoryChip key={d} category={d} />
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="rounded-card border-muted/30 text-muted border px-4 py-2 text-sm font-medium"
      >
        Sign out
      </button>
    </div>
  );
}
