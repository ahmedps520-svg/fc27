# APEX XI on the App Store

The iOS app is the web game in a Capacitor shell. `build-www.mjs` copies the game
into `www/` with one flag set (`APEX_APP_STORE`), and that flag:

- swaps every real player, manager, club and league for an original one (Apple
  guideline 5.2: real names and likenesses need their owners' permission);
- hides the paid items in the store (guideline 3.1.1: digital goods on iPhone
  must use Apple's in-app purchase, which can come in a later update);
- turns off the service worker and the "update available" gate, because the App
  Store delivers updates;
- points the online features at `https://fc27.onrender.com` (change it with
  `APEX_SERVER=https://… node build-www.mjs`).

The website is not affected by any of this.

## One-time setup

### 1. Register the bundle ID

developer.apple.com → Certificates, IDs & Profiles → Identifiers → **+** →
App IDs → App. Description `APEX XI`, Bundle ID (Explicit) `online.apexxi.game`.
No capabilities are needed.

If you use a different bundle ID, set it as a repository **variable** named
`IOS_BUNDLE_ID` (Settings → Secrets and variables → Actions → Variables).

### 2. Create the app record

appstoreconnect.apple.com → Apps → **+** → New App: platform iOS, name `APEX XI`
(or another name if that one is taken), primary language, the bundle ID from
step 1, and any SKU (for example `apexxi-ios`).

### 3. Create an API key for the build machine

App Store Connect → Users and Access → Integrations → App Store Connect API →
Team Keys → **+**. Name it `GitHub Actions`, access **Admin**. Admin is needed
so the build can create the signing certificate and profile in Apple's cloud.
Download the `.p8` file. Apple only lets you download it once.

### 4. Add the GitHub secrets

GitHub → the repo → Settings → Secrets and variables → Actions → New repository
secret. Add these four yourself, and never paste them into a chat or a commit:

| Secret | Where to find it |
| --- | --- |
| `ASC_KEY_ID` | the Key ID column next to the key |
| `ASC_ISSUER_ID` | "Issuer ID" above the keys list |
| `ASC_KEY_P8` | open the `.p8` in a text editor and paste all of it, including the BEGIN/END lines |
| `APPLE_TEAM_ID` | developer.apple.com → Account → Membership details → Team ID |

### 5. Build and upload

GitHub → Actions → **iOS → TestFlight** → Run workflow, then enter the version
(`1.0`). In about 15 minutes the build is uploaded. Apple then processes it,
which takes another 10–30 minutes, and it appears under TestFlight in App Store
Connect. Install the TestFlight app on your iPhone to play it.

## Before you press "Submit for Review"

In App Store Connect, on the app's page:

- **Privacy Policy URL:** `https://fc27.onrender.com/privacy.html`
- **Support URL:** `https://fc27.onrender.com`, or a page with
  support@apexxi.online
- **App Privacy** (the "nutrition label"): Data Not Used to Track You. Collected
  and linked to the user: *User ID* (the player name) and *Other User Content*
  (the cloud save), for App Functionality. Collected and not linked:
  *Crash Data*, for App Functionality.
- **Age rating questionnaire:** answer yes to "Contains simulated gambling /
  loot boxes"; the packs contain random cards bought with in-game coins. With no
  free-text chat, answer no to unrestricted web access and user-generated
  content. Expect a 12+ rating or similar.
- **Category:** Games → Sports. Secondary: Games → Simulation.
- **Screenshots:** at least 3 for a 6.9" iPhone (1320 × 2868 or 2868 × 1320 in
  landscape). Take them from the TestFlight build so they show the original
  names.
- **Sign-in for the reviewer:** online play needs an account. In "App Review
  Information", give a test account name and password that you have created in
  the app, and add a note: "All modes are playable offline; Online needs the
  account above."
- **Export compliance:** already answered in the app (`ITSAppUsesNonExemptEncryption = NO`,
  because the app uses only standard HTTPS).

## Updating the app

Changes to the game reach the website as soon as they merge, but the app only
changes when you run the workflow again and submit the new build. Raise the
version (`1.1`) for a release you submit to review. The build number goes up by
itself.

## Working on the shell

```
cd app
npm ci
node build-www.mjs        # www/ from the game
npx cap sync ios          # copy www/ into ios/App/App/public
npx cap open ios          # on a Mac, to run it in the Simulator
```

`ios/` is the Xcode project, checked in. `www/` and `ios/App/App/public` are
generated and ignored.
