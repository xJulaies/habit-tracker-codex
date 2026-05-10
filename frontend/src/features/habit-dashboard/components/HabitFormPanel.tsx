import { ChevronDown, PlusCircle, Sparkles } from "lucide-react";
import type { CSSProperties, Dispatch, FormEvent, SetStateAction } from "react";
import { useState } from "react";
import {
  habitAccentByColor,
  habitColors,
  MAX_HABITS,
} from "../habitDashboard.constants";
import type { HabitColor, HabitFormState, HabitPlan } from "../habitDashboard.types";

type HabitFormPanelProps = {
  formState: HabitFormState;
  habitCount: number;
  isOpen: boolean;
  isSaving: boolean;
  onChangeFormState: Dispatch<SetStateAction<HabitFormState>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggle: () => void;
};

const getColorLabel = (color: HabitColor): string => {
  return color.charAt(0).toUpperCase() + color.slice(1);
};

const getColorStyle = (color: HabitColor): CSSProperties => {
  return {
    "--swatch": habitAccentByColor[color],
  } as CSSProperties;
};

export function HabitFormPanel({
  formState,
  habitCount,
  isOpen,
  isSaving,
  onChangeFormState,
  onSubmit,
  onToggle,
}: HabitFormPanelProps) {
  const hasReachedLimit = habitCount >= MAX_HABITS;
  const [openMenu, setOpenMenu] = useState<"plan" | "color" | null>(null);

  const selectPlan = (plan: HabitPlan) => {
    onChangeFormState((current) => ({
      ...current,
      plan,
    }));
    setOpenMenu(null);
  };

  const selectColor = (color: HabitColor) => {
    onChangeFormState((current) => ({
      ...current,
      color,
    }));
    setOpenMenu(null);
  };

  return (
    <section className="create-panel" data-open={isOpen}>
      <button
        type="button"
        className="create-toggle"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className="toggle-icon" aria-hidden="true">
          <PlusCircle size={18} strokeWidth={2.2} />
        </span>
        <span>
          <strong>Neues Habit</strong>
          <small>{habitCount}/{MAX_HABITS} Slots genutzt</small>
        </span>
        <ChevronDown size={18} strokeWidth={2.1} />
      </button>

      {isOpen ? (
        <form className="habit-form" onSubmit={(event) => void onSubmit(event)}>
          <label>
            Titel
            <input
              required
              maxLength={80}
              value={formState.title}
              onChange={(event) =>
                onChangeFormState((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </label>

          <label>
            Kategorie
            <input
              required
              maxLength={40}
              value={formState.category}
              onChange={(event) =>
                onChangeFormState((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
            />
          </label>

          <label>
            Beschreibung
            <textarea
              maxLength={300}
              value={formState.description}
              onChange={(event) =>
                onChangeFormState((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </label>

          <div className="field-grid">
            <div className="field-control">
              <span className="field-label">Plan</span>
              <div className="form-menu">
                <button
                  type="button"
                  className="form-menu-trigger"
                  aria-expanded={openMenu === "plan"}
                  onClick={() =>
                    setOpenMenu((current) => (current === "plan" ? null : "plan"))
                  }
                >
                  <span>{formState.plan === "daily" ? "Daily" : "Weekly"}</span>
                  <ChevronDown size={16} strokeWidth={2.1} />
                </button>

                {openMenu === "plan" ? (
                  <div className="form-menu-list plan-menu" role="listbox">
                    {(["daily", "weekly"] as HabitPlan[]).map((plan) => (
                      <button
                        type="button"
                        className="form-menu-option"
                        data-active={formState.plan === plan}
                        key={plan}
                        role="option"
                        aria-selected={formState.plan === plan}
                        onClick={() => selectPlan(plan)}
                      >
                        {plan === "daily" ? "Daily" : "Weekly"}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {formState.plan === "weekly" ? (
              <label>
                Ziel
                <input
                  min={1}
                  max={14}
                  type="number"
                  value={formState.weeklyTarget}
                  onChange={(event) =>
                    onChangeFormState((current) => ({
                      ...current,
                      weeklyTarget: Number(event.target.value),
                    }))
                  }
                />
              </label>
            ) : null}
          </div>

          <div className="field-control">
            <span className="field-label">Farbe</span>
            <div className="form-menu">
              <button
                type="button"
                className="form-menu-trigger"
                aria-expanded={openMenu === "color"}
                aria-label={`Farbe ${getColorLabel(formState.color)} auswählen`}
                onClick={() =>
                  setOpenMenu((current) => (current === "color" ? null : "color"))
                }
                >
                <span
                  className="selected-color-dot"
                  style={getColorStyle(formState.color)}
                />
                <ChevronDown size={16} strokeWidth={2.1} />
              </button>

              {openMenu === "color" ? (
                <div className="form-menu-list color-menu-grid" role="listbox">
                  {habitColors.map((color) => (
                    <button
                      type="button"
                      className="color-choice"
                      style={getColorStyle(color)}
                      data-active={formState.color === color}
                      key={color}
                      role="option"
                      aria-label={`Farbe ${getColorLabel(color)}`}
                      aria-selected={formState.color === color}
                      onClick={() => selectColor(color)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            className="primary-button full-width"
            disabled={isSaving || hasReachedLimit}
          >
            <Sparkles size={17} strokeWidth={2.2} />
            <span>{isSaving ? "Speichert..." : "Habit erstellen"}</span>
          </button>
        </form>
      ) : null}
    </section>
  );
}
