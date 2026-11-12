---
name: react-native-minimal
description: Scaffold a new React Native app with Expo and a minimal setup - no demo screens, no demo assets, no unused native packages, ESLint flat config, Prettier, one screen that says Hello. Use when creating or setting up a new React Native or Expo project, or when asked to strip a fresh create-expo-app down.
metadata:
  trigger: new react native app, new expo app, set up expo, scaffold react native, create-expo-app, stripping a fresh Expo project
  verified: 2026-11-12 with Expo SDK 58.0.24, Expo Router 58.0.31, React Native 0.88.1, React 19.3.0, ESLint 9.39, TypeScript 6.0.3, Prettier 3.10, Xcode 27.2
---

# React Native minimal

A fresh `create-expo-app` ships two demo tabs, an animated logo, a theme layer, web and Android variants, a dozen native packages the demo needs, a README and Expo's own licence file. This skill produces the shape we want instead: TypeScript, Expo Router, ESLint, Prettier, one screen that says Hello, running in a development build.

## Project metadata

Before writing `app.json`, determine the app name, the slug and the platforms.

1. **Check existing project metadata.** Look for `package.json`, `app.json` and project documentation.
2. **Ask which platforms the app targets** when it cannot be established. The steps below assume iOS only; keep the `android` or `web` parts of the scaffold when the project targets them.
3. **Never invent a bundle identifier.** The first native build writes `com.anonymous.<slug>` into `app.json`. Leave it until the user chooses a real one, a reversed domain they own such as `com.example.appname`, and tell them it must be set before the first store submission because it cannot change afterwards.
4. **Never invent personal details.** No placeholder author, email address or URL.

## Steps

1. **Scaffold.** Run in the parent folder. The default template already has TypeScript, Expo Router and a `src/app` routes folder.

   ```bash
   npx create-expo-app@latest <name>
   ```

   The command runs `git init` and makes its own "Initial commit" holding the full template. Use the package manager the folder or monorepo already uses; for a new project default to npm. Commands below are in npm form.

2. **Delete the demo.**

   ```bash
   rm -rf src/components src/hooks src/constants src/global.css src/app/explore.tsx scripts README.md LICENSE
   ```

   In `assets/images` keep `icon.png` and `splash-icon.png` and delete the rest. Keep `assets/expo.icon`, which `app.json` names as the iOS icon. Both icons and the splash image are Expo placeholders until the project has its own.

3. **Uninstall what only the demo used.**

   ```bash
   npm uninstall @expo/ui expo-device expo-font expo-glass-effect expo-image expo-symbols expo-web-browser react-native-gesture-handler react-native-reanimated react-native-worklets react-dom react-native-web
   ```

   Keep `react-dom` and `react-native-web` when the project targets web. Every package on this list is an optional peer of Expo Router, so add one back with `npx expo install` when a feature needs it.

4. **Overwrite with the templates** in `templates/`:

   | Template | Target | Why |
   |----------|--------|-----|
   | `eslint.config.mjs` | root | Flat config, Expo preset, Prettier last, generated folders ignored |
   | `.prettierrc`, `.prettierignore` | root | Prettier as a real dependency, not an editor extension |
   | `src/app/_layout.tsx` | src/app | One native stack with the header hidden; no theme provider, no splash logic |
   | `src/app/index.tsx` | src/app | `Hello` centred and coloured by one `StyleSheet` rule, proving the bundler and styles work |
   | `package.scripts.json` | merge into `package.json` | Adds `typecheck`, `format`, `format:check`; `lint` becomes `eslint .`; drops `reset-project`, `android`, `web` |

5. **Trim `app.json`.** Set `name` to the display name. Remove the `android` and `web` blocks for an iOS-only project. Keep `scheme`, `userInterfaceStyle`, the `expo-router` and `expo-splash-screen` plugins and the `experiments` block. In the splash plugin set `backgroundColor`, `image` and `imageWidth` to the project's own; the image is a transparent PNG, 1024 pixels square, centred on the background colour.

6. **Install the tooling.** `expo install` resolves versions compatible with the installed SDK, so take what it picks.

   ```bash
   npx expo install --dev eslint eslint-config-expo prettier eslint-config-prettier
   npm run format
   ```

7. **Verify.** All four must pass, then the app must launch.

   ```bash
   npm run lint && npm run typecheck && npm run format:check && npx expo-doctor
   npx expo run:ios
   ```

   The first `run:ios` generates the `ios` folder, installs CocoaPods and compiles the native app, which takes several minutes. Confirm the splash shows and the Hello screen follows it.

8. **Hand over the first commit message**, do not run it:

   ```
   chore: minimal expo setup with eslint and prettier
   ```

## Rules

- **`npx expo install`, never `npm install`, for anything Expo or React Native.** It picks the version that matches the SDK. Pass `--dev` for dev dependencies; forwarding `-- --save-dev` put the SDK-versioned package in `dependencies`.
- **Development build, not Expo Go.** The splash screen, the icon and every `app.json` native setting only show correctly in a build made by `npx expo run:ios`. Rebuild after changing `app.json` or adding a package with native code; use `npx expo start` for everyday work on screens.
- **`ios` and `android` are generated and git-ignored.** Never edit them by hand; change `app.json` and rebuild.
- **`lint` script is `eslint .`**, with the config written by hand. `expo lint` would generate its own config on first run.
- **The splash is native config, no code.** With no `preventAutoHideAsync` call it hides on its own when the first screen renders. Add splash logic only when the app has something to wait for.
- **Status bar style belongs to the stack.** In a native stack set `statusBarStyle` in the `Stack` `screenOptions`; the `StatusBar` component from `expo-status-bar` had no effect there. Keep `expo-status-bar` installed, it carries native code Expo expects.
- **Keep `AGENTS.md` and `.claude/settings.json` and commit them.** The first tells assistants to read the versioned Expo docs before touching an Expo API; the second enables the Expo plugin.
- **No README or LICENSE from the scaffold.** The LICENSE names Expo as copyright holder of the template; the project writes its own of both.
- **Keep the `src` folder and the import aliases.** Routes stay in `src/app`, paths stay `@/*` to `./src/*`.

## Compatibility notes, verified 2026-11-12

Re-check these when the installed Expo SDK is newer than the version in the frontmatter.

- eslint-plugin-react-native-a11y 3.5.1 declared `eslint` up to `^8` as a peer, so it could not be installed and the config carries no accessibility rules. When a release lists ESLint 9 or later, add it and set its rules to `error`.
- `expo install` resolved `eslint` to 9.39 while the latest was 10.14. Stay on the version it picks.
- `expo-doctor` passed all 20 checks after the uninstall in step 3, so none of the removed packages is required by SDK 58.
- The scaffold's `tsc --noEmit` failed on the demo's web files before the strip and passed after it.

## Final file list

```
.claude/settings.json  .gitignore            .prettierignore
.prettierrc            .vscode/              AGENTS.md
app.json               assets/expo.icon/     assets/images/icon.png
assets/images/splash-icon.png                eslint.config.mjs
package.json           package-lock.json     src/app/_layout.tsx
src/app/index.tsx      tsconfig.json
```
