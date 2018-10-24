// @flow
import React, { PureComponent } from "react";
import { View, StyleSheet } from "react-native";

import colors from "../../colors";

export default class CounterValuesSeparator extends PureComponent<{}> {
  render() {
    return (
      <View style={styles.separator}>
        <View style={styles.line} />
        {/* TODO: "Use Max" Button when feature is ready */}
        <View style={styles.line} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  iconWrapper: {
    borderColor: colors.live,
    borderWidth: 1,
    borderRadius: 50,
    padding: 7,
    marginHorizontal: 16,
  },
  separator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.fog,
  },
});
