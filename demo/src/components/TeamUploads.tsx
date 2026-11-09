import { useState } from "react";
import { fileToDataUrl } from "../lib/image";

const BOX = "cursor-pointer rounded-xl border border-dashed border-royal px-3 py-2 text-center text-sm text-royal";

/** Team photo and slide deck, asked for together because they go up at the same time. */
export function TeamUploads({
  idPrefix,
  photo,
  deckName,
  onPhoto,
  onDeck,
}: {
  idPrefix: string;
  photo: string;
  deckName: string;
  onPhoto: (dataUrl: string) => void;
  onDeck: (name: string) => void;
}) {
  const [error, setError] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idPrefix}-photo`} className="text-sm font-semibold text-navy">
            Team photo
          </label>
          <label htmlFor={`${idPrefix}-photo`} className={`${BOX} flex items-center justify-center gap-2`}>
            {photo ? <img src={photo} alt="Team preview" className="size-8 rounded-lg object-cover" /> : null}
            {photo ? "Change photo" : "Choose photo"}
            <input
              id={`${idPrefix}-photo`}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setError("");
                  onPhoto(await fileToDataUrl(file));
                } catch {
                  setError("That file could not be read as an image.");
                }
              }}
            />
          </label>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idPrefix}-deck`} className="text-sm font-semibold text-navy">
            Slide deck
          </label>
          <label htmlFor={`${idPrefix}-deck`} className={BOX}>
            {deckName || "Choose file"}
            <input
              id={`${idPrefix}-deck`}
              type="file"
              accept=".pdf,.ppt,.pptx,.key"
              className="sr-only"
              onChange={(e) => onDeck(e.target.files?.[0]?.name ?? "")}
            />
          </label>
        </div>
      </div>
      <p className="text-xs text-muted">
        Upload a photo of the team along with the deck, so investors see who they are helping. Students stay relatively
        anonymous: only year and program are shown.
      </p>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
