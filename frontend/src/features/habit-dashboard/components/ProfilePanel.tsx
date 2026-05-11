import { useClerk, useUser } from "@clerk/clerk-react";
import { LogOut, ShieldCheck, UserCircle } from "lucide-react";

export function ProfilePanel() {
  const { openUserProfile, signOut } = useClerk();
  const { user } = useUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress;

  return (
    <section className="profile-panel">
      <div className="empty-icon" aria-hidden="true">
        <UserCircle size={24} strokeWidth={2.1} />
      </div>
      <div>
        <span className="eyebrow">Profil</span>
        <h2>{user?.fullName || user?.firstName || "Dein Konto"}</h2>
        {primaryEmail ? <p>{primaryEmail}</p> : null}
      </div>

      <button
        type="button"
        className="profile-action profile-action-button"
        onClick={() => openUserProfile()}
      >
        <span className="empty-icon" aria-hidden="true">
          <UserCircle size={22} strokeWidth={2.1} />
        </span>
        <div>
          <strong>Konto verwalten</strong>
          <small>Clerk öffnet Profil, Sessions und Sicherheit.</small>
        </div>
      </button>

      <button
        type="button"
        className="danger-button icon-button full-width"
        onClick={() => void signOut({ redirectUrl: "/" })}
      >
        <LogOut size={17} strokeWidth={2.1} />
        <span>Abmelden</span>
      </button>

      <div className="profile-note">
        <ShieldCheck size={18} strokeWidth={2.1} />
        <p>
          Für diesen Profilbereich reichen aktuell Clerk-Daten. Eigene API-Routen
          brauchen wir erst für App-spezifische Profileinstellungen.
        </p>
      </div>
    </section>
  );
}
