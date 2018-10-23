// @flow
import React from "react";
import { StyleSheet, StatusBar, Platform } from "react-native";
import {
  createStackNavigator,
  createBottomTabNavigator,
  createMaterialTopTabNavigator,
} from "react-navigation";
import colors from "./colors";
import SettingsIcon from "./icons/Settings";
import ManagerIcon from "./icons/Manager";
import AccountsIcon from "./icons/Accounts";
import HeaderTitle from "./components/HeaderTitle";
import { getFontStyle } from "./components/LText";
import HeaderBackImage from "./components/HeaderBackImage";
import defaultNavigationOptions from "./screens/defaultNavigationOptions";
import Portfolio from "./screens/Portfolio";
import Accounts from "./screens/Accounts";
import Account from "./screens/Account";
import Settings from "./screens/Settings";
import CountervalueSettings from "./screens/Settings/General/CountervalueSettings";
import RateProviderSettings from "./screens/Settings/General/RateProviderSettings";
import GeneralSettings from "./screens/Settings/General";
import AboutSettings from "./screens/Settings/About";
import HelpSettings from "./screens/Settings/Help";
import DebugSettings from "./screens/Settings/Debug";
import CurrencySettings from "./screens/Settings/Currencies/CurrencySettings";
import CurrenciesList from "./screens/Settings/Currencies/CurrenciesList";
import Manager from "./screens/Manager";
import ManagerAppsList from "./screens/Manager/AppsList";
import ManagerDevice from "./screens/Manager/Device";
import ReceiveSelectAccount from "./screens/ReceiveFunds/01-SelectAccount";
import ReceiveConnectDevice from "./screens/ReceiveFunds/02-ConnectDevice";
import ReceiveVerifyAddress from "./screens/ReceiveFunds/03-VerifyAddress";
import ReceiveConfirmation from "./screens/ReceiveFunds/04-Confirmation";
import SendFundsMain from "./screens/SendFunds/01-SelectAccount";
import SendSelectRecipient from "./screens/SendFunds/02-SelectRecipient";
import ScanRecipient from "./screens/SendFunds/Scan";
import SendAmount from "./screens/SendFunds/03-Amount";
import SendSummary from "./screens/SendFunds/04-Summary";
import SendConnectDevice from "./screens/SendFunds/05-ConnectDevice";
import SendValidation from "./screens/SendFunds/06-Validation";
import OperationDetails from "./screens/OperationDetails";
import Transfer from "./screens/Transfer";
import AccountSettingsMain from "./screens/AccountSettings";
import EditAccountUnits from "./screens/AccountSettings/EditAccountUnits";
import EditAccountName from "./screens/AccountSettings/EditAccountName";
import ScanAccounts from "./screens/ImportAccounts/Scan";
import DisplayResult from "./screens/ImportAccounts/DisplayResult";
import EditFees from "./screens/EditFees";
import FallBackCameraScreen from "./screens/ImportAccounts/FallBackCameraScreen";
import DebugBLE from "./screens/DebugBLE";
import DebugCrash from "./screens/DebugCrash";
import BenchmarkQRStream from "./screens/BenchmarkQRStream";
import EditDeviceName from "./screens/EditDeviceName";
import PairDevices from "./screens/PairDevices";

// add accounts
import AddAccountsSelectCrypto from "./screens/AddAccounts/01-SelectCrypto";
import AddAccountsSelectDevice from "./screens/AddAccounts/02-SelectDevice";
import AddAccountsAccounts from "./screens/AddAccounts/03-Accounts";
import AddAccountsSuccess from "./screens/AddAccounts/04-Success";

// TODO look into all FlowFixMe

const statusBarPadding =
  Platform.OS === "android" ? StatusBar.currentHeight : 0;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.lightGrey,
  },
  header: {
    height: 48 + statusBarPadding,
    paddingTop: statusBarPadding,
    backgroundColor: colors.white,
    borderBottomWidth: 0,
    elevation: 0,
  },
  bottomTabBar: {
    height: 48,
    borderTopColor: colors.lightFog,
    backgroundColor: colors.white,
  },
  transparentHeader: {
    backgroundColor: "transparent",
  },
  labelStyle: { fontSize: 12 },
});

const StackNavigatorConfig = {
  navigationOptions: {
    headerStyle: styles.header,
    headerTitle: HeaderTitle,
    headerBackTitle: null,
    headerBackImage: HeaderBackImage,
  },
  cardStyle: styles.card,
  headerLayoutPreset: "center",
};

const TransparentHeaderNavigationOptions = {
  headerTransparent: true,
  headerStyle: [styles.header, styles.transparentHeader],
  headerTitle: (props: *) => (
    <HeaderTitle {...props} style={{ color: colors.white }} />
  ),
};

const SettingsStack = createStackNavigator(
  {
    Settings,
    CountervalueSettings,
    RateProviderSettings,
    // $FlowFixMe
    GeneralSettings,
    // $FlowFixMe
    AboutSettings,
    // $FlowFixMe
    HelpSettings,
    CurrenciesList,
    CurrencySettings,
    // $FlowFixMe
    DebugSettings,
    // $FlowFixMe
    DebugBLE,
    // $FlowFixMe
    DebugCrash,
    // $FlowFixMe
    BenchmarkQRStream,
  },
  StackNavigatorConfig,
);

SettingsStack.navigationOptions = {
  ...defaultNavigationOptions,
  tabBarIcon: ({ tintColor }: *) => (
    <SettingsIcon size={18} color={tintColor} />
  ),
};

const ManagerMain = createMaterialTopTabNavigator(
  {
    // $FlowFixMe
    ManagerAppsList,
    // $FlowFixMe
    ManagerDevice,
  },
  {
    tabBarOptions: {
      activeTintColor: colors.live,
      inactiveTintColor: colors.grey,
      upperCaseLabel: false,
      labelStyle: {
        fontSize: 14,
        ...getFontStyle({
          semiBold: true,
        }),
      },
      style: {
        backgroundColor: colors.white,
      },
      indicatorStyle: {
        backgroundColor: colors.live,
      },
    },
  },
);

ManagerMain.navigationOptions = {
  title: "Manager",
};

const ManagerStack = createStackNavigator(
  {
    // $FlowFixMe
    Manager,
    // $FlowFixMe
    ManagerMain,
  },
  StackNavigatorConfig,
);

ManagerStack.navigationOptions = {
  ...defaultNavigationOptions,
  tabBarIcon: ({ tintColor }: *) => <ManagerIcon size={18} color={tintColor} />,
};

const AccountsStack = createStackNavigator(
  {
    Accounts,
    Account,
  },
  StackNavigatorConfig,
);
AccountsStack.navigationOptions = {
  ...defaultNavigationOptions,
  header: null,
  tabBarIcon: ({ tintColor }: *) => (
    <AccountsIcon size={18} color={tintColor} />
  ),
};

const getTabItems = () => {
  const items: any = {
    Portfolio,
    Accounts: AccountsStack,
    Transfer,
    Manager: ManagerStack,
    Settings: SettingsStack,
  };
  return items;
};

const Main = createBottomTabNavigator(getTabItems(), {
  tabBarOptions: {
    style: styles.bottomTabBar,
  },
});

Main.navigationOptions = {
  header: null,
};

const ReceiveFunds = createStackNavigator(
  {
    ReceiveSelectAccount,
    ReceiveConnectDevice,
    ReceiveVerifyAddress,
    ReceiveConfirmation,
  },
  StackNavigatorConfig,
);
ReceiveFunds.navigationOptions = {
  header: null,
};

const AddAccounts = createStackNavigator(
  {
    AddAccountsSelectCrypto,
    AddAccountsSelectDevice,
    AddAccountsAccounts,
    AddAccountsSuccess,
  },
  StackNavigatorConfig,
);

AddAccounts.navigationOptions = {
  header: null,
};

const SendFunds = createStackNavigator(
  {
    SendFundsMain,
    SendSelectRecipient,
    ScanRecipient: {
      screen: ScanRecipient,
      navigationOptions: TransparentHeaderNavigationOptions,
    },
    SendAmount,
    SendSummary,
    SendConnectDevice,
    SendValidation,
  },
  StackNavigatorConfig,
);

SendFunds.navigationOptions = {
  header: null,
};

const SendFundsSettings = createStackNavigator(
  {
    EditFees,
  },
  StackNavigatorConfig,
);

SendFundsSettings.navigationOptions = {
  header: null,
};

const AccountSettings = createStackNavigator(
  {
    AccountSettingsMain,
    EditAccountUnits,
    EditAccountName,
    AccountCurrencySettings: CurrencySettings,
    AccountRateProviderSettings: RateProviderSettings,
  },
  StackNavigatorConfig,
);

AccountSettings.navigationOptions = {
  header: null,
};

const ImportAccounts = createStackNavigator(
  {
    ScanAccounts: {
      screen: ScanAccounts,
      navigationOptions: TransparentHeaderNavigationOptions,
    },
    DisplayResult,
    FallBackCameraScreen,
  },
  StackNavigatorConfig,
);

ImportAccounts.navigationOptions = {
  header: null,
};

export const RootNavigator = createStackNavigator(
  {
    Main,
    ReceiveFunds,
    SendFunds,
    AddAccounts,
    OperationDetails,
    AccountSettings,
    ImportAccounts,
    SendFundsSettings,
    PairDevices,
    // $FlowFixMe non-sense error
    EditDeviceName,
  },
  {
    mode: "modal",
    ...StackNavigatorConfig,
  },
);
