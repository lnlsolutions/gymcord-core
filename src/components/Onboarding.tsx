import { Activity, ArrowRight, Scale, Sparkles, Target, User } from "lucide-react";
import type { Profile } from "../types/gymcord";

interface OnboardingProps {
  profile: Profile;
  error: string;
  saving: boolean;
  onChange: (profile: Profile) => void;
  onSubmit: () => void;
}

const goals = ["Build strength", "Lose body fat", "Improve consistency", "Grow glutes"];

export function Onboarding({ profile, error, saving, onChange, onSubmit }: OnboardingProps) {
  const update = (patch: Partial<Profile>) => onChange({ ...profile, ...patch });

  return (
    <div className="app onboarding-shell">
      <main className="screen onboarding-screen">
        <section className="hero-card onboarding-hero">
          <p className="pill"><Sparkles size={14} /> GymCord Beta</p>
          <h2>Your gym operating system starts here.</h2>
          <p>
            Build a member profile that powers workouts, nutrition, recovery,
            progress tracking, rewards, and Atlas AI coaching.
          </p>
        </section>

        <section className="panel onboarding-panel" aria-labelledby="create-profile-title">
          <div className="section-heading">
            <p className="eyebrow">Account Setup</p>
            <h3 id="create-profile-title">Create your beta profile</h3>
            <span>Required fields are marked with an asterisk.</span>
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          <label className="field-label">
            <span><User size={16} /> Name *</span>
            <input className="input" placeholder="Alex Morgan" value={profile.name} onChange={(event) => update({ name: event.target.value })} />
          </label>

          <label className="field-label">
            <span><Target size={16} /> Primary goal *</span>
            <input className="input" placeholder="Build lean strength" value={profile.goal} onChange={(event) => update({ goal: event.target.value })} />
          </label>

          <div className="goal-chip-grid" aria-label="Suggested goals">
            {goals.map((goal) => (
              <button key={goal} type="button" className={profile.goal === goal ? "selected" : ""} onClick={() => update({ goal })}>
                {goal}
              </button>
            ))}
          </div>

          <div className="form-grid">
            <label className="field-label">
              <span><Scale size={16} /> Current weight</span>
              <input className="input" inputMode="decimal" placeholder="165" value={profile.currentWeight} onChange={(event) => update({ currentWeight: event.target.value })} />
            </label>
            <label className="field-label">
              <span><Scale size={16} /> Goal weight</span>
              <input className="input" inputMode="decimal" placeholder="155" value={profile.goalWeight} onChange={(event) => update({ goalWeight: event.target.value })} />
            </label>
          </div>

          <label className="field-label">
            <span><Activity size={16} /> Activity level</span>
            <select className="input" value={profile.activityLevel} onChange={(event) => update({ activityLevel: event.target.value })}>
              <option value="">Select activity level</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>

          <button className="primary-button cta-button" onClick={onSubmit} disabled={saving}>
            {saving ? "Creating profile..." : "Enter Mission Control"} <ArrowRight size={18} />
          </button>
        </section>
      </main>
    </div>
  );
}
