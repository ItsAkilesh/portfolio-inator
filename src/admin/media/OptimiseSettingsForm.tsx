/**
 * File: OptimiseSettingsForm.tsx
 * Purpose: Settings for optimising uploads (on/off, maximum width, WebP quality), kept per browser.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { useId, useState } from "react";
import {
  readSettings,
  saveSettings,
  type OptimiseSettings,
} from "./optimiseImage";
import ui from "../ui.module.css";

const QUALITY_PERCENT = 100;
const MIN_WIDTH_PX = 64;
const WIDTH_STEP_PX = 16;
const MIN_QUALITY_PERCENT = 50;

/** A typed width, at least the minimum (an empty or invalid entry becomes the minimum). */
const clampWidth = (raw: string): number =>
  Math.max(MIN_WIDTH_PX, Number(raw) || MIN_WIDTH_PX);

/** The settings, saved to this browser on every change. */
function useOptimiseSettings() {
  const [settings, setSettings] = useState<OptimiseSettings>(readSettings);
  const update = (next: Partial<OptimiseSettings>) => {
    const merged = { ...settings, ...next };
    setSettings(merged);
    saveSettings(merged);
  };
  return { settings, update };
}

function QualityField({
  id,
  quality,
  isDisabled,
  onChange,
}: {
  readonly id: string;
  readonly quality: number;
  readonly isDisabled: boolean;
  readonly onChange: (quality: number) => void;
}) {
  const percent = Math.round(quality * QUALITY_PERCENT);
  return (
    <>
      <label htmlFor={id}>Quality ({percent}%)</label>
      <input
        id={id}
        type="range"
        min={MIN_QUALITY_PERCENT}
        max={QUALITY_PERCENT}
        disabled={isDisabled}
        value={percent}
        onChange={(e) => onChange(Number(e.target.value) / QUALITY_PERCENT)}
      />
    </>
  );
}

export function OptimiseSettingsForm() {
  const { settings, update } = useOptimiseSettings();
  const ids = { width: useId(), quality: useId() };
  return (
    <fieldset className={ui.settings}>
      <legend>Uploads</legend>
      <label className={ui.checkLabel}>
        <input
          type="checkbox"
          checked={settings.isEnabled}
          onChange={(e) => update({ isEnabled: e.target.checked })}
        />
        Optimise to WebP before uploading
      </label>
      <label htmlFor={ids.width}>Maximum width (px)</label>
      <input
        id={ids.width}
        className={ui.textInput}
        type="number"
        min={MIN_WIDTH_PX}
        step={WIDTH_STEP_PX}
        disabled={!settings.isEnabled}
        value={settings.maxWidth}
        onChange={(e) => update({ maxWidth: clampWidth(e.target.value) })}
      />
      <QualityField
        id={ids.quality}
        quality={settings.quality}
        isDisabled={!settings.isEnabled}
        onChange={(quality) => update({ quality })}
      />
    </fieldset>
  );
}
