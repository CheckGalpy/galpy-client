import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 80,
    backgroundColor: "white",
  },
  containerLeft: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "baseline",
  },
  containerCenter: {
    flex: 3,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  containerRight: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  backButton: {
    width: 20,
    height: 20,
    marginBottom: 15,
    marginLeft: 10,
  },
  screenTitle: {
    marginBottom: 10,
    fontSize: 18,
  },
  settingButton: {
    width: 25,
    height: 25,
    marginBottom: 10,
    marginRight: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
});

export default styles;
