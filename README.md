# rn-a11y-state-reset-repro

![Build](https://github.com/faciledictu/rn-a11y-state-reset-repro/workflows/Pre%20Merge%20Checks/badge.svg)

On Android, a view keeps parts of an earlier `accessibilityState` (or
`aria-checked`, `aria-busy`, `aria-selected`, `aria-expanded`) after the state
changes (React Native 0.88.0, new architecture). `BaseViewManager.setViewState`
applies only the keys present in the new state: the content description is
rebuilt only when the new state has `busy`, `expanded` or a string `checked`,
and a removed state (`null`, what `View` sends when the last state prop is
removed) returns without clearing anything.

One screen, [`ReproducerApp/App.tsx`](ReproducerApp/App.tsx). Each section has
a Next button that steps through the values. The first element is updated in
place; the second has the same props and is mounted again on every step (a new
`key`), as the control.

## Run

```bash
cd ReproducerApp
yarn install
yarn start
yarn android
```

Read the nodes with A11yProbe
([`A11yProbe.kt`](ReproducerApp/android/app/src/androidTest/java/com/reproducerapp/A11yProbe.kt),
`Instrumentation` + `UiAutomation`, no extra dependencies). It restarts the
app, presses the `before` buttons, then prints each target's content
description, `checkable`, `checked`, `selected` and actions:

```bash
cd ReproducerApp/android && ./gradlew app:assembleDebugAndroidTest
adb install -r app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
adb shell "am instrument -w -e wait 15000 -e before 'Next M,Next M' -e targets 'Toppings M1,Toppings M2' com.reproducerapp.test/com.reproducerapp.A11yProbe"
```

## Results

Android 17 emulator, React Native 0.88.0 built from source with
react/react-native#59540 (on `main` since 29 October 2026). Each section was
read from a fresh launch after 0 to 3 presses (0 to 4 for section 1).

| # | Case | Updated in place | Control (mounted again) |
| - | ---- | ---------------- | ----------------------- |
| 1 | `Pressable` checkbox, `aria-checked` false → 'mixed' → true → 'mixed' → false | after true and after false: "Toppings M1, mixed" | "Toppings M2" |
| 2 | `Pressable`, `aria-busy` true → not set | "Results B1, busy" | "Results B2" |
| 3 | `View`, `aria-busy` true → not set | "Results V1, busy" | "Results V2" |
| 4 | `Pressable`, `aria-busy` true → false | "Results F1" | "Results F2" |
| 5 | `View`, `aria-selected` true → not set | `selected=true` | `selected=false` |
| 6 | `View`, `aria-checked` true → not set | `checkable=true checked=true` | `checkable=false` |
| 7 | `Pressable`, `aria-checked` true → not set | `checkable=false` | `checkable=false` |
| 8 | `View`, `aria-expanded` true → not set | the COLLAPSE action stays | no EXPAND or COLLAPSE |
| 9 | `Pressable`, `aria-expanded` true → not set | the COLLAPSE action stays | no EXPAND or COLLAPSE |

Sections 4 and 7 work: the new state still has `busy`, or `Pressable` sends an
empty state that replaces the old one. With the fix
(react/react-native#59840), every element updated in place matches its control at every step.
