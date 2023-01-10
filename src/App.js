import React from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import {
  Button,
  Box,
  Heading,
  Center,
  Text,
  Input,
  VStack,
  Spacer,
  HStack,
  Flex,
  Avatar,
  IconButton,
} from "@chakra-ui/react";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { IoSend } from "react-icons/io5";

firebase.initializeApp({
  apiKey: "AIzaSyDVzk5KupW0TD7vnYwQliyz5X9__2sKyTE",
  authDomain: "khoa-ng-realtime-chat-app.firebaseapp.com",
  projectId: "khoa-ng-realtime-chat-app",
  storageBucket: "khoa-ng-realtime-chat-app.appspot.com",
  messagingSenderId: "934230338717",
  appId: "1:934230338717:web:3a4d936c3f55f9e648f874",
  measurementId: "G-0SK342HKP5",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  const [roomId, setRoomId] = React.useState();

  return (
    <Center w="100vw" h="100vh" bg="gray.700">
      {user ? (
        <VStack gap="10px" h="90%" w="90%">
          <HStack w="100%">
            <Heading color="gray.200">Chatie 🕊️</Heading>
            <Spacer />
            {roomId && (
              <Button onClick={() => setRoomId("")}>Change Room</Button>
            )}
            <SignOut setRoomId={setRoomId} />
          </HStack>
          {roomId ? (
            <ChatRoom roomId={roomId} />
          ) : (
            <JoinChatRoom setRoomId={setRoomId} />
          )}
        </VStack>
      ) : (
        <VStack gap="50px">
          <Heading color="gray.200">Chatie 🕊️</Heading>
          <SignIn />
        </VStack>
      )}
    </Center>
  );
}

const JoinChatRoom = (props) => {
  const [roomId, setRoomId] = React.useState("");

  const getRoomIdFromUser = async (e) => {
    e.preventDefault();
    props.setRoomId(roomId);
  };

  return (
    <VStack gap="15px" position="absolute" bottom={10} w="90%">
      <Text color="gray.200">
        Enter a room ID to join an existing room, or enter a new room ID to
        create one:
      </Text>
      <form onSubmit={getRoomIdFromUser} style={{ width: "100%" }}>
        <HStack>
          <Input
            color="gray.200"
            placeholder="Type a room ID..."
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            borderRadius="10px"
          />
          <Button borderRadius="10px" colorScheme="messenger" type="submit">
            Join
          </Button>
        </HStack>
      </form>
    </VStack>
  );
};

const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <Button onClick={signInWithGoogle} colorScheme="messenger">
      Sign in with Google
    </Button>
  );
};

const SignOut = (props) => {
  return (
    auth.currentUser && (
      <Button
        colorScheme="red"
        onClick={() => {
          auth.signOut();
          props.setRoomId("");
        }}
      >
        Sign Out
      </Button>
    )
  );
};

const ChatRoom = ({ roomId }) => {
  const lastMessage = React.useRef();

  const messagesRef = firestore.collection(roomId);
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = React.useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");

    lastMessage.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <VStack h="90%" w="100%" gap="10px">
      <Box
        overflowY="auto"
        w="100%"
        sx={{
          "::-webkit-scrollbar": {
            width: "4px",
          },
          "::-webkit-scrollbar-thumb": {
            background: "gray.500",
            borderRadius: "2px",
          },
          "::-webkit-scrollbar-track": {
            background: "gray.700",
          },
        }}
      >
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={lastMessage}></div>
      </Box>
      <Box w="90%" position="absolute" bottom={10}>
        <form onSubmit={sendMessage} style={{ width: "100%" }}>
          <HStack>
            <Input
              color="gray.200"
              placeholder="Type a message..."
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              borderRadius="10px"
            />
            <IconButton
              borderRadius="10px"
              colorScheme="messenger"
              type="submit"
              icon={<IoSend />}
            />
          </HStack>
        </form>
      </Box>
    </VStack>
  );
};

const ChatMessage = (props) => {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <Flex
      key={props.key}
      p="5px"
      flexDir={messageClass === "sent" ? "row-reverse" : "row"}
      gap="5px"
    >
      <Avatar size="sm" src={photoURL} />
      <Text
        bg={messageClass === "sent" ? "#0E91EA" : "gray.600"}
        color="gray.200"
        py="5px"
        px="10px"
        borderRadius="10px"
        maxW="70%"
      >
        {text}
      </Text>
    </Flex>
  );
};

export default App;
