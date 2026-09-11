# Big Jon Steel call-in page

The approved compact design, with working VDO.Ninja and Discord links. The generated page is static HTML and CSS: no visitor JavaScript, database, API, analytics, or package dependencies. Fonts are served with the site.

## Change a link or password

1. Open `settings.json` on GitHub and click the pencil (Edit).
2. Change the value **inside quotation marks** for the field you need:

   | Field | What it changes |
   | --- | --- |
   | `vdoNinjaUrl` | The complete VDO.Ninja call-in URL, including all settings after `?` |
   | `vdoNinjaPassword` | The password displayed to callers; keep quotation marks even for numbers |
   | `discordInviteUrl` | The Discord server invite |
   | `discordChannelName` | The Stage channel name displayed on the page |

3. Keep the existing commas, field names, and braces. Paste plain URLs: use `&`, not `\&` or `&amp;`.
4. Click **Commit changes**, enter a short description, and save to `main` (or use a pull request if branch rules require it).
5. Open **Actions → Publish call-in page**. Wait for the green check, then refresh the public page and check the link.

If the build fails, the existing live version stays published. Open the failed action to see which setting needs fixing. Format checks cannot detect a revoked Discord invite or confirm a room password: verify those in the respective service.

The displayed password is public and changing it here does **not** change the password in VDO.Ninja. Update the room separately, then update this file to match.

## First publication on GitHub Pages

1. Create a public repository in the intended owner's GitHub account (GitHub Free supports Pages for public repositories).
2. Upload/push this project, including `.github/workflows/pages.yml`, to its `main` branch.
3. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
4. Under **Actions → Publish call-in page**, click **Run workflow** on `main` if the first run happened before Pages was enabled.
5. After it succeeds, the Pages address is shown under **Settings → Pages** and in the deployment.
6. Point the desired short link to that address after checking the published page.

The workflow runs tests and builds on pull requests, and publishes changes to `main`. A valid settings edit automatically republishes the page. Neither editor needs to install Node or run commands for routine GitHub edits.

## Preview locally

Install Node.js 22 or later. There are no dependencies to install.

```sh
npm test
npm run preview
```

Open `http://127.0.0.1:4173`. The preview builds once at startup; after editing files, run `npm run build` and refresh. Stop the server with Ctrl+C.

### Preview on an iPhone or another device

Connect the phone to the same home network as the PC (the PC can use Ethernet), then run:

```sh
npm run preview:lan
```

Open the printed **Network** URL in Safari, including `http://` and port `4174`. Keep the PC and preview process running. This serves only the generated public site folder on your local network. If Windows Firewall prompts, allow Node.js on your private network. Guest Wi-Fi or device isolation may prevent the phone from reaching the PC. Stop the preview with Ctrl+C when finished.

## Files and portability

- `settings.json`: routine content updates.
- `src/index.html`: page copy and semantic structure.
- `src/styles.css`: approved compact appearance and responsive rules.
- `src/assets/`: local fonts, font licenses, and BJS favicon.
- `scripts/build.mjs`: validates settings and inserts escaped values into HTML.
- `dist/`: generated public files; do not edit directly or commit.

Run `npm run build` to create `dist/`. GitHub Pages, Cloudflare Pages, Netlify, or any static web host can serve this folder. For Cloudflare's Git integration, use `npm run build` as the build command and `dist` as the output directory. No platform-specific services are required by the page.

Links open in the current tab. The landing page does not request microphone/camera access or automatically join a call. The destination service handles joining.
