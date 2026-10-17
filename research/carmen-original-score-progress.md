# Carmen, Act II: Toréador (Escamillo) — original-score transcription

**Status 2026-10-17:** independent transcription *in progress*, NOT a replacement for the live game soundtrack.

## Public-domain primary source

User-supplied full score: `IMSLP517383-PMLP15769-Bizet_Carmen_Nr.01_Overture_fs_(etc).pdf`, full 583-page PDF, from the historical Choudens score. Act II, No. 14, `Couplets / Votre toast, je peux vous le rendre`: PDF pp. 214–227, vocal line begins at PDF p. 216 (printed p. 213).

Source: https://imslp.org/wiki/Special:ReverseLookup/517383

- Time signature: **4/4** (common time), printed at p. 214.
- Opening tempo: **Allegro molto moderato, quarter = 108**, printed at p. 214.
- Singer: Escamillo, **bass clef**, three-flat key signature.
- Pitches transcribed here come directly from the user's image scan, **not** `CostardRouge/system-g`.

## Provisional measures, start of `Votre toast` (PDF p. 216)

`onset` and `length` are counted in quarter-note beats relative to each 4/4 measure. These are working pitches to be proofread against the scan; **the second measure has unresolved details about grace note, tie and accidentals**.

| vocal measure | onset | length | pitch / note |
|---|---:|---:|---|
| 1 | 0.0 | 0.5 | C4 |
| 1 | 0.5 | 0.5 | B♮3 |
| 1 | 1.0 | 1.0 | C4 |
| 1 | 2.0 | 0.5 | eighth rest |
| 1 | 2.5 | 0.5 | B♮3 |
| 1 | 3.0 | 0.5 | C4 |
| 1 | 3.5 | 0.5 | B♭3 |
| 2 | 0.0 | 0.5 | A3 (short grace note omitted pending verification) |
| 2 | 0.5 | 0.5 | G3 |
| 2 | 1.0 | 1.5 | B♭3 (tie placement pending review) |
| 2 | 2.5 | 0.5 | A3 |
| 2 | 3.0 | 0.5 | B♭3 |
| 2 | 3.5 | 0.5 | eighth rest |

Both measures sum to exactly 4 quarter-note beats. This is a **format/rhythmic consistency test**, not yet independent verification of every symbol on the score.

Locally prepared reproducible artifacts (not yet in repository): `Carmen_Original_Vocal_First2bars_DRAFT.musicxml`, `.mid`, `.wav`, `.mp3`, `.csv`, `.json`, and `carmen_original_2bars_build.py`. All indicate *DRAFT* and are intentionally separate from the production game.

## Next verification work

1. Recheck all accidentals and notehead levels in these measures at high zoom. Verify ornament/grace and tie across the second bar.
2. Continue bar by bar along the Escamillo staff through PDF p. 227, retaining rests, re-entries, and repetitions. Each bar must add to four beats except a directly verified pickup.
3. Manually verify repeated sung phrases against each appearance and read the orchestral cues for intervening passages.
4. After the score is independently and completely transcribed, add original 8bit accompaniment, render music, check melody/audio, and then remove the Système G-derived `toreadorVocal` array from `game-music-data.js`. Only then update `MUSIC_SOURCES.md` as rights-cleared.

**Do not claim the published game soundtrack is source-cleared yet. Do not use Système G's pitches as the transcription source.**
