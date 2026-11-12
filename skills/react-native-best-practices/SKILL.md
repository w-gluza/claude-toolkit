---
name: react-native-best-practices
description: React Native and Expo code-review rules distilled from the official React Native and Expo docs, each with a source link. Load when reviewing or writing React Native components, styles, lists, Expo Router routes, accessibility props, app config, eas.json or release changes so the code matches what the documentation prescribes.
allowed-tools: Read, Grep
---

# React Native best practices (from reactnative.dev and docs.expo.dev)

Target: React Native 0.88 with Expo SDK 58 and Expo Router. Extracted 2026-11-12 from the React Native 0.88 documentation and the Expo SDK 58 documentation; see NOTICE.md for the licences.

## Before applying any rule

1. Read the installed versions from `node_modules/react-native/package.json` and `node_modules/expo/package.json` (fall back to the entries in `package.json`). On a newer Expo SDK or React Native version, say which version the project is on and treat rules marked with a version, "deprecated" or "experimental" as needing a check against the current docs.
2. Check whether the project uses Expo. No `expo` dependency means a bare React Native app: the React Native rules still hold, and the Expo Router, app config, EAS and `EXPO_PUBLIC_` rules do not apply.
3. Check whether the native folders are generated. `ios/` and `android/` listed in `.gitignore` means Continuous Native Generation: native changes belong in the app config and config plugins. Committed native folders mean the project edits them directly, and the prebuild rules do not apply.
4. Check `app.json` or `app.config` for `experiments.reactCompiler`. With the compiler on, the rules that ask for manual `useCallback` or `React.memo` are covered by it.

## How to use this file

This file is the review checklist and the normal load: the rules that most often catch real defects, grouped by the smell you see in a diff, each tagged [correctness], [security], [accessibility], [performance] or [maintainability], or with the WCAG 2.2 success criterion it serves. Correctness, security and accessibility rules hold everywhere; the other two are defaults the project's CLAUDE.md may override. The full set (656 rules, each with a short quotation from the docs and one source link) lives in `references/`. Grep there for the exact wording or a rule not listed here; never read a reference file whole, each is about 50 KB.

- `references/components-and-styling.md` - View, Text, Pressable and Touchables, TextInput, Image, ScrollView, StyleSheet, sizing, flexbox, colours, platform-specific code, keyboard, safe areas, Modal, StatusBar, colour scheme
- `references/lists-and-performance.md` - FlatList, SectionList, VirtualizedList, RefreshControl, Animated, LayoutAnimation, gestures, the JavaScript thread, bundle size, React Compiler, images, build speed
- `references/routing-and-navigation.md` - Expo Router project structure, route notation, layouts, navigation, URL parameters, Stack, tabs, modals, protected routes, deep linking, redirects, error boundaries, splash screen and fonts, the Android back button
- `references/accessibility.md` - labels, roles, state and value, hiding content, live regions, actions, focus, touch targets, text scaling, inputs, motion, colour scheme, right-to-left layout, testing
- `references/config-builds-and-release.md` - app config, Continuous Native Generation, config plugins, development builds, dependencies, environment variables, splash screen and icon, permissions, versions, EAS Build, credentials, store submission, EAS Update, upgrading
- `references/security-data-and-native.md` - secrets in the bundle, device storage, deep links and authentication, transport security, Linking, AppState, permissions, removed core modules, background work, libraries, TypeScript, native modules, debugging, testing

When citing a rule in a review, link the source so the author can read the reasoning. For hooks, effects and state use react-best-practices; for types use typescript-best-practices; this skill holds only what is specific to React Native and Expo.

## 1. Pressables, images and core components

Smell: a new `Touchable*` import, a tiny icon as the only press target, an `Image` with nothing but a `uri`, or a `Modal` with no close handler.

- [maintainability] **Use `Pressable` for new press handling.** The Touchable pages point to `Pressable` as the future-proof API, so a newly added `TouchableOpacity` or `TouchableHighlight` import needs a reason. https://reactnative.dev/docs/touchableopacity
- [correctness] **Do not use `TouchableWithoutFeedback`.** Anything that responds to a press should show it; use `Pressable` and derive the pressed look from its `style` function instead of an `isPressed` state. https://reactnative.dev/docs/touchablewithoutfeedback and https://reactnative.dev/docs/pressable#style
- [WCAG 2.5.8] **Enlarge small touch targets with `hitSlop` or padding.** Aim for 30 to 40 points; the touch area is cut off at the parent's bounds, so a parent the size of the icon needs room as well. https://reactnative.dev/docs/view#hitslop
- [correctness] **Set `pointerEvents='box-none'` on overlay containers.** An absolute-fill wrapper that only positions a floating child otherwise swallows every touch meant for the content beneath it. https://reactnative.dev/docs/view#pointerevents
- [correctness] **Give network and data images explicit dimensions.** `<Image source={{uri}} />` needs `width` and `height`, or one of them plus `aspectRatio`; without a size nothing is drawn. https://reactnative.dev/docs/image
- [correctness] **Keep image `require` paths static.** The bundler resolves images at build time, so choose between whole `require` calls instead of concatenating or templating the path. https://reactnative.dev/docs/images#static-image-resources
- [correctness] **Handle `onRequestClose` on every `Modal`.** It is what the Android hardware back button calls, and `BackHandler` events are not emitted while a modal is open. https://reactnative.dev/docs/modal#onrequestclose
- [correctness] **Give every `ScrollView` a bounded height.** Pass `flex: 1` down through each ancestor; a wrapper with no flex and no height leaves content cut off and unscrollable. https://reactnative.dev/docs/scrollview

## 2. Text and inputs

Smell: a string or number rendered outside `<Text>`, `allowFontScaling={false}`, or an `onChangeText` handler that slices or rejects input.

- [correctness] **Wrap every string in `<Text>`.** A text node directly under a `View` is not allowed; watch `{count}` and `{label && <Icon />}` where `label` can be an empty string or `0`. https://reactnative.dev/docs/text#limited-style-inheritance
- [correctness] **Do not lay out children of `<Text>` with flexbox.** Elements inside `Text` follow text layout and wrap at the line end; put `flexDirection`, `justifyContent` and `gap` on a `View`. https://reactnative.dev/docs/text#containers
- [WCAG 1.4.4] **Leave font scaling on.** Fix the layout rather than setting `allowFontScaling={false}`; where an element truly cannot grow, cap it with `maxFontSizeMultiplier`, knowing a cap below 2 stops text reaching double size. https://reactnative.dev/docs/text#allowfontscaling and https://reactnative.dev/docs/text#maxfontsizemultiplier
- [correctness] **Limit or block input with `maxLength` or `editable`, not in JavaScript.** Slicing the text or keeping the old `value` in `onChangeText` shows the rejected character for a frame. https://reactnative.dev/docs/textinput#maxlength and https://reactnative.dev/docs/textinput#value
- [security] **Do not combine `secureTextEntry` with `multiline`.** It does not work there, and on Android it is also unsupported with `keyboardType` `email-address` or `phone-pad`, so the secret can show in clear text. https://reactnative.dev/docs/textinput#securetextentry and https://reactnative.dev/docs/textinput#known-issues
- [WCAG 1.3.5] **Set `autoComplete` on fields that collect personal data, and do not pair it with `textContentType`.** `autoComplete` works on all platforms; when both are set `textContentType` takes precedence. https://reactnative.dev/docs/textinput#autocomplete and https://reactnative.dev/docs/textinput#textcontenttype-ios
- [correctness] **Set `keyboardShouldPersistTaps='handled'` on scroll views that hold a form.** With the default `'never'` the first tap on a submit button only dismisses the keyboard. https://reactnative.dev/docs/scrollview#keyboardshouldpersisttaps
- [correctness] **Set `behavior` on every `KeyboardAvoidingView`, and `keyboardVerticalOffset` under a header.** The two platforms treat `behavior` differently, and with a zero offset below a navigation header the last input stays partly covered. https://reactnative.dev/docs/keyboardavoidingview#behavior and https://reactnative.dev/docs/keyboardavoidingview#keyboardverticaloffset

## 3. Styles, layout and safe areas

Smell: CSS units or web flexbox habits in a style object, `Dimensions.get` at module scope, or a hard-coded `paddingTop: 44`.

- [correctness] **Write dimensions as unitless numbers or percentages.** Values are density-independent pixels; `'16px'`, `em`, `rem` and `vh` are not supported. https://reactnative.dev/docs/height-and-width#fixed-dimensions and https://reactnative.dev/docs/layout-props#height
- [correctness] **Do not assume web flexbox defaults.** `flexDirection` defaults to `column` and `flexShrink` to `0`, so set `row` explicitly and add `flexShrink: 1` to text that must shrink beside an icon. https://reactnative.dev/docs/flexbox
- [correctness] **Give the parent a size before using `flex` on children.** A parent with no fixed dimensions and no `flex` measures `0`, and its `flex` children are invisible with no error. https://reactnative.dev/docs/height-and-width#flex-dimensions
- [correctness] **Read window size with `useWindowDimensions`.** It updates on rotation, split screen and foldables; do not feed a module-scope `Dimensions.get('window')` into `StyleSheet.create`. https://reactnative.dev/docs/dimensions
- [correctness] **Read the colour scheme with `useColorScheme` on every render, and handle `null`.** Never cache `Appearance.getColorScheme()` at module scope, and give the theme lookup a default branch. https://reactnative.dev/docs/appearance and https://reactnative.dev/docs/usecolorscheme#return-values
- [correctness] **Import `SafeAreaView` from `react-native-safe-area-context`, not from `react-native`.** The core component is deprecated and only applies to iOS devices, so Android gets no insets. https://reactnative.dev/docs/safeareaview
- [correctness] **Take per-edge insets from `useSafeAreaInsets`, not device constants.** `paddingTop: 44` or a platform-conditional `paddingBottom: 34` is wrong on the next device shape. https://docs.expo.dev/develop/user-interface/safe-areas/#alternate-usesafeareainsets-hook
- [correctness] **Do not use `SafeAreaView` to clear a stack header.** It applies only the status bar inset; in SDK 58 on iOS 26 and later the `Stack` header is transparent, so set automatic `contentInsetAdjustmentBehavior` on the root scroll view or `headerTransparent: false`. https://docs.expo.dev/router/migrate/sdk-57-to-58/#review-the-ios-header-appearance

## 4. Platform differences

Smell: a style, event or API that was checked on one platform only, or a `Platform.Version` comparison with no `Platform.OS` check.

- [correctness] **Do not expect the `shadow*` props to draw a shadow on Android.** Only `shadowColor` works on both platforms and the rest are iOS only; use `boxShadow` or `elevation` for Android. https://reactnative.dev/docs/shadow-props
- [correctness] **Do not use negative margins for overlap.** They are not supported on Android; use absolute positioning or a transform. https://reactnative.dev/docs/style#known-issues
- [correctness] **Give `Platform.select` a `default` or `native` key.** With only `ios` and `android` keys, any other platform, such as web, receives `undefined`. https://reactnative.dev/docs/platform#select
- [correctness] **Compare `Platform.Version` with the right type per platform.** On Android it is the API level (write `>= 33`, not `>= 13`); on iOS it is a string, so `parseInt` it first. https://reactnative.dev/docs/platform-specific-code#detecting-the-android-version-android and https://reactnative.dev/docs/platform-specific-code#detecting-the-ios-version-ios
- [correctness] **Listen to `keyboardDidShow` and `keyboardDidHide` in shared code.** The `Will` events are not available on Android; keep them in an iOS branch and remove the subscription in the cleanup. https://reactnative.dev/docs/keyboard#addlistener
- [correctness] **Handle `inactive` on iOS and tolerate `background` on Android.** `inactive` is an iOS-only transition state; on Android a system activity such as an autofill picker reports `background`, so an immediate lock or token clear breaks it. https://reactnative.dev/docs/appstate#app-states
- [correctness] **Scope `BackHandler` to Android, return `true` only when the press was handled, and remove the subscription.** A handler that always returns `true` blocks back navigation; iOS needs its own route to the same intent. https://reactnative.dev/docs/backhandler and https://reactnative.dev/docs/backhandler#example
- [correctness] **Request dangerous Android permissions at runtime and handle all three results.** A manifest entry alone is not enough; branch on granted, denied and never-ask-again, and offer a route to system settings for the last. https://reactnative.dev/docs/permissionsandroid and https://reactnative.dev/docs/permissionsandroid#request

## 5. Lists

Smell: `items.map(...)` inside a `ScrollView`, a `FlatList` whose rows read state from outside `data`, or an index used as the key.

- [performance] **Render long or growing collections with `FlatList`, not a mapped `ScrollView`.** A `ScrollView` renders every child at once; keep it for short, bounded content. https://reactnative.dev/docs/scrollview
- [correctness] **Pass `extraData` whenever rows read anything outside `data`, and replace it rather than mutate it.** The list is a `PureComponent`: a stable `renderItem` reading `selectedId`, or an array mutated in place, leaves rows stale. https://reactnative.dev/docs/flatlist#example and https://reactnative.dev/docs/flatlist#extradata
- [correctness] **Keep row state in the item data or a store, not in the row.** Rows outside the render window are unmounted, so an expanded flag or draft input held in the row's `useState` is lost on scroll. https://reactnative.dev/docs/flatlist
- [correctness] **Provide a stable `keyExtractor` when items have neither `key` nor `id`.** The fallback is the index, which misattributes rows after an insert, delete or sort. https://reactnative.dev/docs/flatlist#keyextractor
- [correctness] **Supply `getItemLayout` or a failure handler before scrolling to an index.** `initialScrollIndex` requires `getItemLayout`, and `scrollToIndex` to an unmeasured row needs it or `onScrollToIndexFailed`. https://reactnative.dev/docs/flatlist#initialscrollindex and https://reactnative.dev/docs/virtualizedlist#onscrolltoindexfailed
- [correctness] **Pair `onRefresh` with a truthful `refreshing` value.** Set it true when the refresh starts and false when it settles, including on error; a hard-coded `false` stops the indicator at once. https://reactnative.dev/docs/flatlist#onrefresh
- [correctness] **Express `onEndReachedThreshold` in visible lengths, not pixels.** `0.5` means half a screen from the end; a value such as `100` fires `onEndReached` immediately and over-fetches pages. https://reactnative.dev/docs/virtualizedlist#onendreachedthreshold
- [correctness] **Treat `removeClippedSubviews` as a risk, not a free optimisation.** It can cause missing content, mainly observed on iOS and with transforms or absolute positioning in rows; on Android it defaults to `true`. https://reactnative.dev/docs/flatlist#removeclippedsubviews and https://reactnative.dev/docs/optimizing-flatlist-configuration#removeclippedsubviews
- [performance] **Do not define `renderItem` inline, and memoise row components.** Move `renderItem` out of the JSX and wrap it in `useCallback`; pass rows primitives or stable references. With React Compiler enabled the memoisation is automatic. https://reactnative.dev/docs/optimizing-flatlist-configuration#avoid-anonymous-function-on-renderitem and https://reactnative.dev/docs/optimizing-flatlist-configuration#use-memo

## 6. Animation and performance

Smell: an `Animated` config with no `useNativeDriver` key, `new Animated.Value` in a function component body, or `setState` inside `onScroll`.

- [performance] **State `useNativeDriver` in every animation config, and set it `true` for `transform` and `opacity`.** An omitted option defaults to false with a warning and runs the animation on the JavaScript thread. https://reactnative.dev/docs/animations#using-the-native-driver and https://reactnative.dev/docs/animated#using-the-native-driver
- [correctness] **Do not drive layout properties with the native driver.** Only non-layout properties are supported; animate `translateX` or `scale` instead of `left`, `width` or `height`, or use `LayoutAnimation`. https://reactnative.dev/docs/animations#caveats
- [correctness] **Create each `Animated.Value` once per component instance.** Use `useAnimatedValue` or a ref; a value constructed in the render body is replaced on every render and the running animation is lost. https://reactnative.dev/docs/animated#value
- [correctness] **Check `finished` in the `start` callback.** The callback also fires when the animation is stopped early, so `start(() => setVisible(false))` runs after an interruption too. https://reactnative.dev/docs/animated#working-with-animations
- [performance] **Bind scroll-linked animation through a native-driven `Animated.event`.** A JavaScript `onScroll` that calls `setValue` or `setState` runs a frame behind the gesture; if the handler must stay in JavaScript, set `scrollEventThrottle`. https://reactnative.dev/docs/animations#using-the-native-driver and https://reactnative.dev/docs/scrollview#scrolleventthrottle
- [correctness] **Call `LayoutAnimation` before the state update it should animate.** It schedules an animation for the next layout only, so a call after `setState` or inside an effect animates nothing or the wrong change. https://reactnative.dev/docs/layoutanimation
- [performance] **Remove `console.*` calls from production bundles.** In a bundled app they bottleneck the JavaScript thread; strip them at build time and guard logging middleware. https://reactnative.dev/docs/performance#using-consolelog-statements
- [performance] **Measure performance in release builds only.** JavaScript thread performance suffers greatly in dev mode, so frame rates or timings from a development build are not evidence. https://reactnative.dev/docs/performance#running-in-development-mode-devtrue

## 7. Expo Router files and navigation

Smell: a component, util or test file under `src/app`, `router.push` at the end of a sign-in handler, or navigation fired from an effect on mount.

- [correctness] **Keep only routes and layouts in the app directory.** Components, hooks, utilities and test files placed under `src/app` are treated as routes; move them to sibling directories. https://docs.expo.dev/router/basics/core-concepts/#6-non-navigation-components-live-outside-the-srcapp-directory and https://docs.expo.dev/router/reference/testing/#configuration
- [correctness] **Match each `Stack.Screen` `name` to its route file name.** Use the file name without the extension, brackets and parentheses kept; options given to a name that matches no route are never applied. https://docs.expo.dev/router/basics/navigation-layouts/#stacks
- [correctness] **Declare every screen that should appear in tabs or a drawer.** From SDK 58 these navigators show only screens declared in the layout, so a new file in `(tabs)/` needs a matching `Tabs.Screen` or trigger. https://docs.expo.dev/router/migrate/sdk-57-to-58/#declare-tabs-and-drawer-screens
- [correctness] **Use `replace` when the current screen must not stay in history.** After sign-in, onboarding or a redirect, a `push` lets the back gesture return to the screen that was meant to be gone. https://docs.expo.dev/versions/v58.0.0/sdk/router/link/#replace
- [correctness] **Redirect with the `Redirect` component, not from an effect.** Returning `<Redirect>` navigates without rendering the current page; `router.replace` in `useEffect` shows the unwanted screen first. https://docs.expo.dev/router/basics/navigation/#redirects
- [correctness] **Prefer `useRouter()` inside components.** The module-level `router` throws before the first router render and cannot tell several router roots apart. https://docs.expo.dev/router/migrate/sdk-57-to-58/#prefer-userouter-in-components
- [correctness] **Read params with `useLocalSearchParams` in screens.** It updates only while the route is focused; `useGlobalSearchParams` follows every URL change and re-renders screens in the background. https://docs.expo.dev/versions/v58.0.0/sdk/router/#useglobalsearchparams and https://docs.expo.dev/router/reference/url-parameters/#local-versus-global-url-parameters
- [correctness] **Tie screen-scoped work to focus.** A screen still pushed on the stack keeps rendering, so start timers, polling and subscriptions in `useFocusEffect`, with the callback wrapped in `useCallback`. https://docs.expo.dev/router/basics/navigation-layouts/#stacks and https://docs.expo.dev/versions/v58.0.0/sdk/router/#usefocuseffecteffect-do_not_pass_a_second_prop
- [correctness] **Call `SplashScreen.preventAutoHideAsync()` at module scope and hide the splash on every code path.** Inside a component the call may run too late; set the ready flag in a `finally` block so a rejected load cannot leave the app stuck. https://docs.expo.dev/versions/v58.0.0/sdk/splash-screen/#splashscreenpreventautohideasync and https://docs.expo.dev/versions/v58.0.0/sdk/splash-screen/#delay-hiding-the-splash-screen

## 8. Deep links and protected routes

Smell: an auth check that lives in one screen's effect, a token in a URL, or a `+native-intent.tsx` that parses the path with no error handling.

- [security] **Gate private screens with protected routes.** Wrap them in `Stack.Protected` with a `guard` in the layout; unlike a check on an entry screen, it is evaluated when a deep link opens the page directly. https://docs.expo.dev/router/basics/common-navigation-patterns/#authenticated-users-only-protected-routes
- [security] **Enforce access on the server as well.** Protected screens are evaluated on the client only, so every request for protected data needs its own authorisation on the back end. https://docs.expo.dev/router/advanced/protected/#static-rendering-considerations
- [security] **Assume every route can be opened from outside the app.** Deep linking is enabled for all screens automatically; guard sensitive screens and validate params on each screen that reads them. https://docs.expo.dev/linking/overview/#use-expo-router-to-handle-deep-linking
- [correctness] **Hold the splash screen until the session has loaded, and keep sign-in outside the protected group.** A guard reading `!!session` before loading ends flashes the sign-in screen; a sign-in route inside the group is unreachable when signed out. https://docs.expo.dev/router/advanced/authentication/#using-protected-routes
- [security] **Never put sensitive data in a deep link, and treat custom-scheme input as untrusted.** Another app can register the same scheme; pass an opaque identifier and never accept a link as proof of identity. https://reactnative.dev/docs/security#authentication-and-deep-linking
- [correctness] **Never let `redirectSystemPath` throw.** It runs for every incoming native link and the input may not be a valid path or URL; wrap the body in `try/catch` and return a fallback route. https://docs.expo.dev/versions/v58.0.0/sdk/router/#nativeintent and https://docs.expo.dev/router/advanced/native-intent/#rewrite-incoming-native-deep-links
- [security] **Keep auth decisions out of `+native-intent`.** The file is processed outside the app's context with no access to session or route state; rewrite the URL there and leave access to protected routes. https://docs.expo.dev/router/advanced/native-intent/#using-redirectsystempath
- [correctness] **Do not hand-roll URL handling beside Expo Router.** The router already resolves incoming links, so a `Linking` `url` listener that calls `router.push` navigates twice. https://docs.expo.dev/linking/into-your-app/#handle-urls
- [correctness] **Use verified `https` links for anything shared outside the app, with `autoVerify` on Android.** A custom-scheme link does nothing when the app is not installed; an `intentFilters` entry without `autoVerify: true` opens a chooser instead of the app. https://docs.expo.dev/linking/into-your-app/ and https://docs.expo.dev/linking/android-app-links/#add-intentfilters-to-the-app-config
- [security] **Use PKCE for every OAuth redirect flow.** In Expo AuthSession leave `usePKCE` on and never choose the plain challenge method. https://reactnative.dev/docs/security#oauth2-and-redirects and https://docs.expo.dev/versions/v58.0.0/sdk/auth-session/#authrequestconfig

## 9. Accessibility

Smell: an icon-only `Pressable` with no label, a custom control with no role or state, or status text that changes with no announcement.

- [WCAG 4.1.2] **Label every accessible element that has no readable text.** Icon-only buttons, image buttons and custom controls need `accessibilityLabel` or `aria-label`. https://reactnative.dev/docs/accessibility#accessibilitylabel
- [WCAG 4.1.2] **Give every custom control a role.** Set `role` or `accessibilityRole` on pressables that are not already a `Button`, `Switch` or `TextInput`; keep `link` for elements that open a URL and use `button` for in-app navigation. https://reactnative.dev/docs/accessibility#accessibilityrole
- [WCAG 4.1.2] **Mark a custom touch target as `accessible`, and do not nest accessible elements.** Only the touchable components are accessible by default; a `Pressable` inside a `Pressable` row may be unreachable on one platform. https://reactnative.dev/docs/accessibility#accessible
- [WCAG 4.1.2] **Expose the disabled state, not only the disabled look.** Reduced opacity plus an early return in `onPress` is announced as an active button; set `aria-disabled` or `accessibilityState` with `disabled`. https://reactnative.dev/docs/accessibility#aria-disabled
- [WCAG 4.1.2] **Expose selected and checked state on custom tabs, chips, checkboxes and radios.** Selection shown only by colour or a swapped icon is not announced; set `aria-selected` or `aria-checked`, or the matching `accessibilityState` field. https://reactnative.dev/docs/accessibility#aria-selected and https://reactnative.dev/docs/accessibility#aria-checked
- [WCAG 1.1.1] **Give informative images `alt` text.** An `Image` is not an accessibility element by default; `alt` both names it and marks it accessible. https://reactnative.dev/docs/image#alt
- [accessibility] **Hide only what is decorative or covered, and hide it on both platforms.** `aria-hidden` removes the whole subtree, so never put it on a container with operable content; `accessibilityElementsHidden` alone is iOS only. https://reactnative.dev/docs/accessibility#aria-hidden and https://reactnative.dev/docs/accessibility#accessibilityelementshidden-ios
- [WCAG 4.1.3] **Announce dynamic changes on both platforms.** `accessibilityLiveRegion` is Android only; for iOS, and for toasts with no focusable element, call `AccessibilityInfo.announceForAccessibility`. https://reactnative.dev/docs/accessibility#accessibilityliveregion-android and https://reactnative.dev/docs/accessibilityinfo#announceforaccessibility
- [accessibility] **Offer gesture-only features as accessibility actions, and handle them.** Swipe-to-delete, drag-to-reorder and long-press menus need an entry in `accessibilityActions` with a matching `onAccessibilityAction`. https://reactnative.dev/docs/accessibility#accessibility-actions
- [WCAG 3.3.2] **Do not use the placeholder as the field's label.** It disappears once the user types; give the `TextInput` a visible label and an accessible name. https://reactnative.dev/docs/textinput#placeholder
- [WCAG 2.3.3] **Respect reduce motion, and subscribe to changes.** Check `AccessibilityInfo.isReduceMotionEnabled()` before non-essential animation and listen for `reduceMotionChanged`; a value read once at start-up goes stale. https://reactnative.dev/docs/accessibilityinfo#isreducemotionenabled and https://reactnative.dev/docs/accessibilityinfo#addeventlistener

## 10. Secrets, storage and network

Smell: a credential in source, app config or an `EXPO_PUBLIC_` variable, a token written to `AsyncStorage`, or an `http://` URL.

- [security] **Keep API keys and secrets out of app code and app config.** Anything in the bundle, native config or assets can be read in plain text, and most of the app config is readable at runtime. https://reactnative.dev/docs/security#storing-sensitive-info and https://docs.expo.dev/workflow/configuration/#reading-configuration-values-in-your-app
- [security] **Never put secrets in `EXPO_PUBLIC_` variables.** The prefix inlines the value into the client bundle; use it for public identifiers and endpoints only. https://docs.expo.dev/guides/environment-variables/#security-considerations
- [correctness] **Read `EXPO_PUBLIC_` variables with static dot notation.** `process.env['EXPO_PUBLIC_KEY']`, destructuring or a computed key is not inlined, so the value is `undefined` at runtime. https://docs.expo.dev/guides/environment-variables/#how-to-read-from-environment-variables
- [security] **Put secret-bearing calls behind a server, including the OAuth client secret.** The app calls your endpoint and the endpoint adds the key; `clientSecret` in an AuthSession config in the app cannot be stored securely. https://reactnative.dev/docs/security#storing-sensitive-info and https://docs.expo.dev/versions/v58.0.0/sdk/auth-session/#security-considerations
- [security] **Keep tokens and secrets out of Async Storage.** It is unencrypted; store credentials through a library that wraps the iOS Keychain and Android encrypted storage. https://reactnative.dev/docs/security#async-storage and https://reactnative.dev/docs/security#secure-storage
- [security] **Exclude sensitive data from persisted state and monitoring payloads.** Allowlist what a persistence layer writes, and filter tokens, headers and personal data before they reach crash or analytics reporting. https://reactnative.dev/docs/security#secure-storage
- [correctness] **Handle `null` and rejection from SecureStore reads.** A missing or invalidated key resolves to `null`; a cancelled or failed biometric prompt is an outcome to retry or back out of, not a reason to delete the credential. https://docs.expo.dev/versions/v58.0.0/sdk/securestore/#securestoregetitemasynckey-options
- [security] **Do not treat a biometric prompt or a client-side token check as authentication.** Biometrics are a local gate on a credential held on the device; the server verifies the session token's signature and expiry on every request. https://docs.expo.dev/develop/authentication/#biometrics and https://docs.expo.dev/develop/authentication/#managing-sessions-after-oauth
- [security] **Call only `https` endpoints, and do not switch transport security off.** Flag `NSAllowsArbitraryLoads` (scope iOS exceptions to named domains) and `android:usesCleartextTraffic` set to true in the main manifest. https://reactnative.dev/docs/security#network-security and https://reactnative.dev/docs/network#using-fetch
- [correctness] **Catch errors from every `fetch`.** An uncaught rejection is dropped silently and leaves a spinner running; add `try/catch` or `.catch` and surface a state the UI can show. https://reactnative.dev/docs/network#handling-the-response

## 11. App config and native generation

Smell: a hand edit under `ios/` or `android/` in a project that generates them, a new permission request with no config change, or an `async` app.config.

- [correctness] **Never hand-edit or commit generated `android` and `ios` directories in a CNG project.** Manual edits are lost on the next `prebuild --clean`, and once the directories are uploaded the build skips prebuild, so app config and plugin changes stop applying. https://docs.expo.dev/workflow/continuous-native-generation/#usage and https://docs.expo.dev/workflow/continuous-native-generation/#usage-with-expo-build
- [correctness] **Regenerate with `npx expo prebuild --clean`.** Without the flag, changes are layered on existing files and some config plugins are not idempotent. https://docs.expo.dev/workflow/continuous-native-generation/#clean
- [correctness] **Return a plain object from dynamic config, never a Promise.** An `async` function or awaited fetch in app.config is invalid; fetch values before the CLI runs and pass them in through environment variables. https://docs.expo.dev/workflow/configuration/#configuration-resolution-rules
- [correctness] **Spread the incoming config in function-form app.config, and keep every key inside `expo`.** The function's return value is the final config, and keys placed beside a top-level `expo` object are ignored. https://docs.expo.dev/workflow/configuration/#configuration-resolution-rules
- [security] **Treat everything under `extra` as public, and read config through `Constants.expoConfig`.** `extra` travels with every build and update; importing app.json or app.config.js into app code pulls in the whole unprocessed file. https://docs.expo.dev/versions/v58.0.0/config/app/#extra and https://docs.expo.dev/workflow/configuration/#reading-configuration-values-in-your-app
- [correctness] **Configure permissions natively in the same change as the request call.** A new `requestPermissionsAsync()` needs its plugin option or app config entry, and on iOS a usage message tailored to the use case. https://docs.expo.dev/guides/permissions/ and https://docs.expo.dev/guides/permissions/#ios
- [correctness] **Install dependencies with `npx expo install`, and use a development build for libraries with native code.** The command picks a version compatible with the SDK; Expo Go does not contain the native code of every library. https://docs.expo.dev/workflow/using-libraries/#installing-a-third-party-library and https://docs.expo.dev/workflow/using-libraries/#determining-third-party-library-compatibility
- [correctness] **Use only the standard `.env` file names, and do not set `NODE_ENV` to pick an environment (SDK 58 and later).** Files such as `.env.staging` are not loaded, and each command replaces any `NODE_ENV` value you set. https://docs.expo.dev/guides/environment-variables/#using-multiple-env-files-to-define-separate-environments and https://docs.expo.dev/guides/environment-variables/#environment-variables-and-node_env
- [correctness] **Define a `scheme` in the app config, and ship scheme changes as a new binary.** Without one the app falls back to the Android package and iOS bundle identifier; the value is build-time configuration with no effect in Expo Go. https://docs.expo.dev/router/basics/navigation/#deep-links and https://docs.expo.dev/versions/v58.0.0/config/app/#scheme

## 12. Builds, updates and release

Smell: a native dependency or permission shipped by update only, a signing file in the diff, or an `eas update` step with no environment.

- [correctness] **Ship native changes as a new binary with a new runtime version, not as an update.** An update replaces only JavaScript, styling and assets; one that calls native code missing from the installed build fails on launch. https://docs.expo.dev/eas-update/introduction/#when-to-use-expo-update and https://docs.expo.dev/eas-update/runtime-versions/
- [correctness] **Bump `version` with every native change under the `appVersion` policy.** The policy derives the runtime version from `version` alone, so a forgotten bump produces a runtime version mismatch. https://docs.expo.dev/eas-update/runtime-versions/#use-a-runtime-version-policy-that-automatically-updates-the-runtime-version-when-native-code-is-updated
- [correctness] **Fix the channel before creating a build, and set `channel` on custom-named profiles.** The channel embedded in a build cannot be changed afterwards, and only `preview` and `production` are filled in automatically. https://docs.expo.dev/eas-update/deployment/ and https://docs.expo.dev/eas-update/getting-started/#configure-the-update-channel
- [correctness] **Pass `--environment` to `eas update`, and do not rely on build-profile `env` there.** Variables under `build.<profile>.env` are not available to `eas update`, so the update bundle can differ from the binary it targets. https://docs.expo.dev/eas/environment-variables/usage/#using-environment-variables-with-expo-update and https://docs.expo.dev/build/updates/#environment-variables-and-eas-update
- [correctness] **Do not ship `updates.useEmbeddedUpdate: false` or `updates.disableAntiBrickingMeasures`.** The first is not meant for production; the second is liable to leave an app bricked. https://docs.expo.dev/versions/v58.0.0/config/app/#useembeddedupdate and https://docs.expo.dev/versions/v58.0.0/config/app/#disableantibrickingmeasures
- [security] **Never commit a release keystore, `credentials.json` or the files it references.** Only debug keystores are an exception; `credentials.json` holds keystore and certificate passwords in plain text. https://docs.expo.dev/app-signing/app-credentials/#app-signing-by-google-play and https://docs.expo.dev/app-signing/local-credentials/#credentialsjson
- [security] **Keep the update code signing private key outside the repository.** Commit only the certificate; whoever holds the key can sign updates that the app will accept. https://docs.expo.dev/eas-update/code-signing/#generate-a-private-key-and-corresponding-certificate
- [security] **Keep secrets out of the `eas.json` `env` block, and copy `.gitignore` into any new `.easignore`.** `eas.json` is committed, and an `.easignore` replaces every `.gitignore`, so unlisted env files and credentials are uploaded. https://docs.expo.dev/eas/json/#env and https://docs.expo.dev/build-reference/easignore/
- [correctness] **Never route a development profile to a store, and do not set `buildType: 'apk'` on a store profile.** Development builds include developer tools, and an APK cannot be submitted to the Google Play Store. https://docs.expo.dev/build/eas-json/#development-builds and https://docs.expo.dev/submit/android/#build-a-production-app
- [correctness] **Review any Android submit profile that sets a track.** `track: 'production'` with `releaseStatus: 'completed'` releases to all users as soon as the upload finishes, which cannot be undone. https://docs.expo.dev/build/automate-submissions/#android-submissions

## 13. Deprecated and removed APIs

Smell: an import or option carried over from an older React Native or Expo SDK version that now does nothing, warns or throws.

- [correctness] **Do not import `AsyncStorage` or `Clipboard` from `react-native`.** Both are removed from core; use a community or Expo package. https://reactnative.dev/docs/asyncstorage and https://reactnative.dev/docs/clipboard
- [correctness] **Replace `blurOnSubmit` with `submitBehavior` (deprecated).** `submitBehavior` overrides whatever `blurOnSubmit` defines; use `'submit'`, `'blurAndSubmit'` or `'newline'`. https://reactnative.dev/docs/textinput#submitbehavior
- [correctness] **Call `scrollTo` with an options object (positional form deprecated).** The positional form takes `y` before `x`, so swapped arguments scroll the wrong axis. https://reactnative.dev/docs/scrollview#scrollto
- [correctness] **Import only from the `react-native` root, and type refs with `*Instance` types (0.87+).** The Strict TypeScript API removes deep imports such as `react-native/Libraries/...`, and component names no longer work as ref types. https://reactnative.dev/docs/strict-typescript-api
- [correctness] **Replace `beforeRemove` listeners.** The event is removed in SDK 58 and never fires; block removal with `usePreventRemove`. https://docs.expo.dev/router/migrate/sdk-57-to-58/#replace-beforeremove-and-__unsafe_action__
- [correctness] **Replace the removed `redirect` and `initialParams` screen props.** Render `Redirect` from the route file, use a protected route for access control, and default params where the screen reads them. https://docs.expo.dev/router/migrate/sdk-57-to-58/#replace-redirect-and-initialparams
- [correctness] **Move `initialRouteName` to `unstable_settings.anchor`.** The navigator prop is removed and the settings key is deprecated; `anchor` sets the back destination and must not be used to choose the launch screen. https://docs.expo.dev/router/migrate/sdk-57-to-58/#move-initialroutename-to-unstable_settings
- [correctness] **Navigate to nested screens with a complete href.** In SDK 58 the `screen`, `params` and `initial` keys arrive as ordinary parameters and no longer build nested state. https://docs.expo.dev/router/migrate/sdk-57-to-58/#navigate-with-complete-hrefs
- [correctness] **Await `renderRouter` and upgrade Jest with `jest-expo` (SDK 58).** `renderRouter` now returns a promise, and `jest-expo` requires Jest 30. https://docs.expo.dev/router/migrate/sdk-57-to-58/#update-router-tests and https://docs.expo.dev/develop/unit-testing/#migrate-tests-to-sdk-58

## Relationship to a project's CLAUDE.md

A project's own React Native conventions usually restate a subset of these rules. Where they overlap, cite the documentation so the reasoning is visible. Where the project's CLAUDE.md is stricter (for example one touchable component everywhere, or no inline styles), the project rule wins.
