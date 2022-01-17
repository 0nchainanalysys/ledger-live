import React from "react";
import ReactNativeModal, { ModalProps } from "react-native-modal";
import styled from "styled-components/native";
import { StyleProp, ViewStyle } from "react-native";

import sizes from "../../../../helpers/getDeviceSize";
import Link from "../../../cta/Link";
import CloseMedium from "@ledgerhq/icons-ui/native/CloseMedium";
import Text from "../../../Text";
import { IconOrElementType } from "../../../Icon/type";
import { BoxedIcon } from "../../../Icon";
import { Flex } from "../../index";

const { width, height } = sizes;

export type BaseModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  modalStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  preventBackdropClick?: boolean;
  Icon?: IconOrElementType;
  iconColor?: string;
  title?: string;
  description?: string;
  subtitle?: string;
  children?: React.ReactNode;
} & Partial<ModalProps>;

const Container = styled.View`
  background-color: ${(p) => p.theme.colors.background.main};
  width: 100%;
  padding: 16px;
  min-height: 350px;
`;

const ContentContainer = styled.View`
  flex-shrink: 1;
  flex-grow: 1;
`;

const HeaderContainer = styled.View`
  display: flex;
  align-items: center;
  margin-bottom: ${(p) => p.theme.space[7]}px;
`;

const CloseContainer = styled.View`
  display: flex;
  align-items: flex-end;
  margin-bottom: ${(p) => p.theme.space[7]}px;
`;

const StyledTitle = styled(Text).attrs({ variant: "h3" })`
  text-transform: uppercase;
`;

const StyledDescription = styled(Text).attrs({
  variant: "body",
  color: "neutral.c80",
})`
  margin-top: ${(p) => p.theme.space[2]}px;
`;

const StyledSubtitle = styled(Text).attrs({
  variant: "subtitle",
  color: "neutral.c80",
})`
  text-transform: uppercase;
  text-align: center;
  margin-bottom: ${(p) => p.theme.space[2]}px;
`;

const defaultModalStyle = {
  flex: 1,
  margin: 16,
};

export default function BaseModal({
  isOpen,
  onClose = () => {},
  containerStyle = {},
  modalStyle = {},
  preventBackdropClick,
  Icon,
  iconColor,
  title,
  description,
  subtitle,
  children,
  ...rest
}: BaseModalProps): React.ReactElement {
  const backDropProps = preventBackdropClick
    ? {}
    : {
        onBackdropPress: onClose,
        onBackButtonPress: onClose,
        onSwipeComplete: onClose,
      };

  return (
    <ReactNativeModal
      {...rest}
      {...backDropProps}
      isVisible={isOpen}
      deviceWidth={width}
      deviceHeight={height}
      useNativeDriver
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      onModalHide={onClose}
      style={[defaultModalStyle, modalStyle]}
    >
      <Container style={containerStyle}>
        <CloseContainer>
          <Link Icon={CloseMedium} onPress={onClose} />
        </CloseContainer>
        <HeaderContainer>
          {Icon && (
            <Flex mb={7}>
              {React.isValidElement(Icon) ? (
                Icon
              ) : (
                <BoxedIcon size={64} Icon={Icon} iconSize={24} iconColor={iconColor} />
              )}
            </Flex>
          )}
          {subtitle && <StyledSubtitle>{subtitle}</StyledSubtitle>}
          {title && <StyledTitle>{title}</StyledTitle>}
          {description && <StyledDescription>{description}</StyledDescription>}
        </HeaderContainer>
        <ContentContainer>{children}</ContentContainer>
      </Container>
    </ReactNativeModal>
  );
}
