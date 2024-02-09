import * as React from 'react';

import {KeyboardAvoidingView, Pressable, StyleSheet} from 'react-native';

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {MarkdownTextInput} from '@expensify/react-native-live-markdown';
import {MasonryFlashList} from '@shopify/flash-list';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

const AnimatedMarkdownTextInput =
  Animated.createAnimatedComponent(MarkdownTextInput);

const MARKDOWN_STYLE = {
  h1: {
    fontSize: 20,
  },
  pre: {
    backgroundColor: 'transparent',
  },
  code: {
    backgroundColor: 'transparent',
  },
  blockquote: {
    borderColor: 'rgba(0,0,0,0.15)',
    borderWidth: 6,
    marginLeft: 0,
    paddingLeft: 8,
  },
  mentionHere: {
    color: 'brown',
    backgroundColor: 'yellow',
  },
  mentionUser: {
    color: 'dodgerblue',
    backgroundColor: 'lightblue',
  },
};

interface Note {
  tag: string;
  color: string;
  text: string;
}

const DEFAULT_NOTES: Note[] = [
  {
    tag: 'note1',
    color: 'lightgreen',
    text: '# React Native Live Markdown\nhttps://github.com/Expensify/react-native-live-markdown\nDrop-in replacement for `<TextInput>` component',
  },
  {
    tag: 'note2',
    color: '#ffd3fd',
    text: 'Made with 💖 at *Software Mansion* for *Expensify*',
  },
  {
    tag: 'note6',
    color: 'white',
    text: '# Heading\n*Bold* _italic_ ~strikethrough~\n*_~nested~_*\n`inline code`\n> Blockquote',
  },
  {
    tag: 'note4',
    color: 'lightskyblue',
    text: '```\nyarn add @expensify/react-native-live-markdown\n```',
  },
  {
    tag: 'note5',
    color: '#ffac9d',
    text: 'this is just a `<TextInput>` with some magic',
  },
  {
    tag: 'note3',
    color: 'lemonchiffon',
    text: '> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque iaculis est a cursus pellentesque. Phasellus id massa sit amet lacus pellentesque maximus molestie in diam. Morbi commodo pellentesque dignissim. Morbi augue nunc, finibus quis dapibus tincidunt, vulputate vel ligula. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed laoreet feugiat enim, sed condimentum lorem varius non. Mauris quis neque venenatis, mattis massa vel, feugiat felis. Phasellus id augue cursus ex vehicula porttitor. ',
  },
  {
    tag: 'note7',
    color: 'paleturquoise',
    text: '🌐 Supports Android, iOS & web',
  },
  {
    tag: 'note8',
    color: 'lightgray',
    text: '⌨️ Live synchronous formatting on every keystroke',
  },
  {
    tag: 'note9',
    color: 'lavender',
    text: '⚡ Fully native experience:\n• selection\n• spellcheck\n• autocomplete',
  },
  {
    tag: 'note10',
    color: 'wheat',
    text: '🎨 Customizable styles',
  },
];

interface SmallNoteProps {
  note: Note;
  onPress: () => void;
}

function SmallNote({note, onPress}: SmallNoteProps) {
  return (
    <Pressable onPress={onPress}>
      <AnimatedMarkdownTextInput
        multiline
        autoCapitalize="none"
        value={note.text}
        editable={false}
        style={[styles.smallNote, {backgroundColor: note.color}]}
        markdownStyle={MARKDOWN_STYLE}
        pointerEvents="none"
        sharedTransitionTag={note.tag}
      />
    </Pressable>
  );
}

type ParamList = {
  HomeScreen?: object;
  NoteScreen: {tag: string};
};

const Stack = createNativeStackNavigator<ParamList>();

function HomeScreen({
  navigation,
}: NativeStackScreenProps<ParamList, 'HomeScreen'>) {
  return (
    <MasonryFlashList
      contentContainerStyle={styles.contentContainer}
      data={DEFAULT_NOTES}
      numColumns={2}
      renderItem={({item}) => (
        <SmallNote
          note={item}
          onPress={() => navigation.navigate('NoteScreen', {tag: item.tag})}
        />
      )}
      estimatedItemSize={150}
    />
  );
}

function NoteScreen({
  route,
  navigation,
}: NativeStackScreenProps<ParamList, 'NoteScreen'>) {
  const tag = route.params.tag;

  const note = DEFAULT_NOTES.find(item => item.tag === tag);

  const [text, setText] = React.useState(note.text);

  const goBack = React.useCallback(() => {
    navigation.navigate('HomeScreen');
  }, [navigation]);

  const offset = useSharedValue({x: 0, y: 0});

  const translation = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: offset.value.x * 0.3},
        {translateY: offset.value.y * 0.3},
      ],
    };
  });

  const pan = Gesture.Pan()
    .manualActivation(true)
    .onChange(e => {
      'worklet';
      offset.value = {
        x: e.changeX + offset.value.x,
        y: e.changeY + offset.value.y,
      };
      if (Math.abs(offset.value.x) > 150 || Math.abs(offset.value.y) > 250) {
        runOnJS(goBack)();
      }
    })
    .onFinalize(() => {
      'worklet';
      offset.value = withSpring({x: 0, y: 0});
    })
    .onTouchesMove((e, state) => {
      state.activate();
    });

  return (
    <Pressable style={styles.overlay} onPress={goBack}>
      <KeyboardAvoidingView
        behavior="height"
        style={styles.keyboardAvoidingView}>
        {note && (
          <GestureDetector gesture={pan}>
            <Animated.View style={translation}>
              <AnimatedMarkdownTextInput
                multiline
                autoCapitalize="none"
                value={text}
                onChangeText={setText}
                style={[styles.bigNote, {backgroundColor: note.color}]}
                markdownStyle={MARKDOWN_STYLE}
                sharedTransitionTag={note.tag}
              />
            </Animated.View>
          </GestureDetector>
        )}
      </KeyboardAvoidingView>
    </Pressable>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            animation: 'fade',
          }}>
          <Stack.Screen
            name="HomeScreen"
            options={{headerTitle: 'Marknotes'}}
            component={HomeScreen}
          />
          <Stack.Screen
            name="NoteScreen"
            component={NoteScreen}
            options={{headerShown: false, presentation: 'transparentModal'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const NOTES_GAP = 12;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  contentContainer: {
    padding: NOTES_GAP / 2,
  },
  keyboardAvoidingView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  smallNote: {
    fontSize: 16,
    margin: NOTES_GAP / 2,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'gold',
    overflow: 'hidden',
    maxHeight: 200,
  },
  bigNote: {
    fontSize: 16,
    width: 300,
    minHeight: 300,
    maxHeight: 300,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'gold',
  },
});
