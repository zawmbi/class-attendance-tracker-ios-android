// Use the official in-memory AsyncStorage mock so persisted zustand stores work
// under test without a native module.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
