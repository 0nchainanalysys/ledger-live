// @flow
import React, { Component } from "react";
import i18next from "i18next";
import hoistNonReactStatic from "hoist-non-react-statics";
import { reactI18nextModule } from "react-i18next";
import Locale from "react-native-locale";
import { locales } from "../languages";

export type TranslateFunction = (string, ?Object) => string;

const languageDetector = {
  type: "languageDetector",
  detect: () => {
    const { localeIdentifier, preferredLanguages } = Locale.constants();
    const locale =
      (preferredLanguages && preferredLanguages[0]) || localeIdentifier;
    return locale.replace("_", "-");
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

const i18n = i18next
  .use(languageDetector)
  .use(reactI18nextModule)
  .init({
    fallbackLng: "en",
    resources: locales,
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false, // not needed for react as it does escape per default to prevent xss!
    },
  });

const LocaleContext = React.createContext({
  i18n,
  t: i18n.getFixedT(),
  locale: i18n.language,
});

type State = {
  i18n: *,
  t: TranslateFunction,
  locale: string,
};

export default class LocaleProvider extends React.Component<
  {
    children: *,
  },
  State,
> {
  state = {
    i18n,
    t: i18n.getFixedT(),
    locale: i18n.language,
  };

  componentDidMount() {
    i18next.on("languageChanged", locale => {
      this.setState({
        i18n,
        t: i18n.getFixedT(locale),
        locale: i18n.language,
      });
    });
  }

  render() {
    return (
      <LocaleContext.Provider value={this.state}>
        {this.props.children}
      </LocaleContext.Provider>
    );
  }
}

export const withLocale = (
  Cmp: React$ComponentType<*>,
): React$ComponentType<*> => {
  class WithLocale extends Component<*> {
    render() {
      return (
        <LocaleContext.Consumer>
          {(val: State) => <Cmp {...this.props} {...val} />}
        </LocaleContext.Consumer>
      );
    }
  }
  WithLocale.displayName = `withLocale(${Cmp.displayName ||
    Cmp.name ||
    "Component"})`;
  hoistNonReactStatic(WithLocale, Cmp);
  return WithLocale;
};
