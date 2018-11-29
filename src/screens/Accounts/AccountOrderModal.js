/* @flow */

import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import { translate } from "react-i18next";

import { withNavigation, SafeAreaView } from "react-navigation";
import type { T } from "../../types/common";

import MenuTitle from "../../components/MenuTitle";
import OrderOption from "./OrderOption";
import BottomModal from "../../components/BottomModal";
import Button from "../../components/Button";

const forceInset = { bottom: "always" };

class AccountOrderModal extends Component<{
  navigation: *,
  isOpened: boolean,
  onClose: () => void,
  t: T,
}> {
  render() {
    const { onClose, isOpened, t } = this.props;
    return (
      <BottomModal onClose={onClose} isOpened={isOpened}>
        <SafeAreaView forceInset={forceInset}>
          <MenuTitle>{t("common:common.sortBy")}</MenuTitle>
          <OrderOption id="balance" />
          <OrderOption id="name" />
          <View style={styles.buttonContainer}>
            <Button type="primary" onPress={onClose} title="Done" />
          </View>
        </SafeAreaView>
      </BottomModal>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: { paddingHorizontal: 16, marginTop: 16 },
});

export default translate()(withNavigation(AccountOrderModal));
