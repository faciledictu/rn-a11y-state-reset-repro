import { Fragment, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

// Android keeps parts of an earlier accessibilityState after the state
// changes. Each section has a Next button that steps through the values; the
// first element is updated in place, the second is mounted again with the
// same props (a new key) as the control.
//
// Inspect with
// `adb shell uiautomator dump /sdcard/ui.xml && adb pull /sdcard/ui.xml`
// (content-desc, checkable, checked, selected) and A11yProbe for the actions;
// the README says what to look at.

const box = { padding: 8, borderWidth: 1, borderColor: '#888' } as const;

function show(value: boolean | 'mixed' | undefined) {
  return value === undefined ? 'not set' : String(value);
}

function Section<Value extends boolean | 'mixed' | undefined>({
  id,
  title,
  prop,
  values,
  render,
}: {
  id: string;
  title: string;
  prop: string;
  values: Value[];
  render: (name: string, value: Value) => ReactNode;
}) {
  const [step, setStep] = useState(0);
  const value = values[step % values.length];

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontWeight: '600' }}>{title}</Text>
      <Text>
        Step {step}: {prop} {show(value)}
      </Text>
      <Pressable
        accessibilityLabel={`Next ${id}`}
        onPress={() => setStep(s => s + 1)}
        style={box}
      >
        <Text>Next {id}</Text>
      </Pressable>
      {render(`${id}1`, value)}
      <Fragment key={step}>{render(`${id}2`, value)}</Fragment>
    </View>
  );
}

export default function App() {
  return (
    <ScrollView contentContainerStyle={{ padding: 48, gap: 24 }}>
      <Section
        id="M"
        title="1. aria-checked from 'mixed' to true or false, Pressable"
        prop="aria-checked"
        values={[false, 'mixed', true, 'mixed']}
        render={(name, value) => (
          <Pressable
            role="checkbox"
            aria-checked={value}
            accessibilityLabel={`Toppings ${name}`}
            style={box}
          >
            <Text>Toppings {name}</Text>
          </Pressable>
        )}
      />

      <Section
        id="B"
        title="2. aria-busy removed, Pressable"
        prop="aria-busy"
        values={[true, undefined]}
        render={(name, value) => (
          <Pressable
            aria-busy={value}
            accessibilityLabel={`Results ${name}`}
            style={box}
          >
            <Text>Results {name}</Text>
          </Pressable>
        )}
      />

      <Section
        id="V"
        title="3. aria-busy removed, View"
        prop="aria-busy"
        values={[true, undefined]}
        render={(name, value) => (
          <View
            accessible
            aria-busy={value}
            accessibilityLabel={`Results ${name}`}
            style={box}
          >
            <Text>Results {name}</Text>
          </View>
        )}
      />

      <Section
        id="F"
        title="4. aria-busy from true to false, Pressable (works)"
        prop="aria-busy"
        values={[true, false]}
        render={(name, value) => (
          <Pressable
            aria-busy={value}
            accessibilityLabel={`Results ${name}`}
            style={box}
          >
            <Text>Results {name}</Text>
          </Pressable>
        )}
      />

      <Section
        id="S"
        title="5. aria-selected removed, View"
        prop="aria-selected"
        values={[true, undefined]}
        render={(name, value) => (
          <View
            accessible
            aria-selected={value}
            accessibilityLabel={`Row ${name}`}
            style={box}
          >
            <Text>Row {name}</Text>
          </View>
        )}
      />

      <Section
        id="K"
        title="6. aria-checked removed, View"
        prop="aria-checked"
        values={[true, undefined]}
        render={(name, value) => (
          <View
            accessible
            aria-checked={value}
            accessibilityLabel={`Terms ${name}`}
            style={box}
          >
            <Text>Terms {name}</Text>
          </View>
        )}
      />

      <Section
        id="P"
        title="7. aria-checked removed, Pressable (works)"
        prop="aria-checked"
        values={[true, undefined]}
        render={(name, value) => (
          <Pressable
            aria-checked={value}
            accessibilityLabel={`Terms ${name}`}
            style={box}
          >
            <Text>Terms {name}</Text>
          </Pressable>
        )}
      />

      <Section
        id="E"
        title="8. aria-expanded removed, View"
        prop="aria-expanded"
        values={[true, undefined]}
        render={(name, value) => (
          <View
            accessible
            aria-expanded={value}
            accessibilityLabel={`Details ${name}`}
            style={box}
          >
            <Text>Details {name}</Text>
          </View>
        )}
      />

      <Section
        id="X"
        title="9. aria-expanded removed, Pressable"
        prop="aria-expanded"
        values={[true, undefined]}
        render={(name, value) => (
          <Pressable
            aria-expanded={value}
            accessibilityLabel={`Details ${name}`}
            style={box}
          >
            <Text>Details {name}</Text>
          </Pressable>
        )}
      />
    </ScrollView>
  );
}
