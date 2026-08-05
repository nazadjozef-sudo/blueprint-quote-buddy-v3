# Release & auto-update architecture (Windows)

Zero GitHub. Zero manual steps. One command:

```
npm run release:win
```

## Pipeline

```
Windows dev machine
   └── npm run release:win
        ├── BUILD    vite build + esbuild updater bundle + electron-builder (NSIS)
        ├── UPLOAD   installer + blockmap PUT DIRECTLY to Supabase Storage
        │            (signed upload URL issued by the control plane)
        ├── VERIFY   stored size, feed 302 → Storage, range read, sha512 vs latest.yml
        └── PUBLISH  latest.yml written LAST + release row recorded (atomic)

Client PC (installed app)
   └── electron-updater (generic provider)
        ├── GET  /functions/v1/updates/latest.yml        (tiny text, inline)
        ├── GET  /functions/v1/updates/<installer>.exe   → 302 → Supabase Storage
        │        bytes stream from Storage, never through a function
        ├── sha512 verified by electron-updater
        └── prompt → quitAndInstall → restart
```

The Edge Function is a **control plane only**: it authenticates, signs, verifies,
publishes and redirects. It never buffers or streams a binary, so a 502 from
installer size is structurally impossible. Validated with a 560 MB artifact.

## One-time setup (Windows)

```
setx RELEASE_UPLOAD_TOKEN <token>
```

Open a new terminal afterwards. The same value is stored in the backend secret
`RELEASE_UPLOAD_TOKEN`. It is only ever used by the release script on your
machine — it is never present in the app or the frontend.

## Releasing

1. Change the app in Lovable, press Publish.
2. Pull the code to Windows.
3. Bump `version` in `package.json`.
4. Optional: write `RELEASE_NOTES.md` (shown in the update dialog).
5. `npm run release:win`

Output is stage-labelled; a failure names the exact stage and stops before
anything is published:

```
[BUILD]   artifact DrawingAnalyzer-Setup-1.0.2.exe {"mb":93.8,"sha512":"…"}
[UPLOAD]  stored via <project>.supabase.co
[VERIFY]  size OK / 302 → Storage / range read 206
[PUBLISH] latest.yml is live for 1.0.2
[RESULT]  Release 1.0.2 published successfully.
```

## Extra commands

| Command | Purpose |
| --- | --- |
| `npm run release:win` | build + upload + verify + publish |
| `npm run publish:update` | runs `scripts/upload-release.mjs` to upload/verify/publish an existing `release/` folder |
| `npm run release:rollback -- 1.0.1` | re-point clients to a previous version (no rebuild) |
| `RELEASE_CHANNEL=beta npm run release:win` | publish to `beta.yml` instead of `latest.yml` |

## Control-plane API (`/functions/v1/updates`)

| Route | Auth | Purpose |
| --- | --- | --- |
| `POST /sign` | token | signed upload URL (direct to Storage) |
| `POST /verify` | token | size / existence check of a stored artifact |
| `POST /publish` | token | writes the manifest + release record, atomically |
| `POST /rollback` | token | republish a stored manifest |
| `POST /prune` | token | delete artifacts of old releases (keeps the newest N) |
| `GET /latest.yml` | public | electron-updater manifest |
| `GET /<file>` | public | 302 to a signed Storage URL, 6 h validity |
| `GET /releases` | public | release history + notes |
| `GET /` | public | health + currently published version |

Every route logs structured JSON with a `stage` field
(`AUTH`, `SIGN`, `VERIFY`, `PUBLISH`, `ROLLBACK`, `DOWNLOAD`, `MANIFEST`).
The client updater logs `[UPDATER][CHECK|DOWNLOAD|VERIFY|INSTALL]`.

## Release history & rollback

Every publish is recorded in the `app_releases` table with version, artifact
sizes, sha512, manifest and release notes. `latest.yml` is only overwritten
after every binary is confirmed present and size-checked in Storage, so clients
never see a manifest without its installer. Rollback simply re-publishes a
stored manifest.

## Notes / limits

* Build the NSIS installer on Windows; cross-building from Linux is not supported.
* Uploads use a single authenticated PUT with 5 automatic retries and a fresh
  signed URL per attempt. Supabase's signed-upload endpoint accepted 560 MB in
  12 s in testing. TUS resumable uploads are not used because Supabase requires
  a privileged session for TUS creation, which must never live on a dev machine.
* Delta updates: the `.blockmap` is uploaded and served, so electron-updater
  performs differential downloads when it can, with full-installer fallback.

## Fully automated releases (GitHub Actions → Supabase Storage)

`.github/workflows/release-windows.yml` builds the NSIS installer on a
`windows-latest` runner and runs the same UPLOAD → VERIFY → PUBLISH stages
against Supabase Storage. GitHub is used only as a build machine — no GitHub
Releases, no `GH_TOKEN`.

One-time setup:

1. Connect the Lovable project to GitHub (Project → GitHub).
2. In the repo: Settings → Secrets and variables → Actions → **New repository
   secret** → name `RELEASE_UPLOAD_TOKEN`, value = the same token stored in the
   backend secret.

Then every version bump of `package.json` pushed to `main` triggers a build and
publishes `latest.yml` + installer + blockmap automatically. The workflow skips
itself if the feed already serves that version, and can also be started by hand
from the Actions tab (Run workflow).
