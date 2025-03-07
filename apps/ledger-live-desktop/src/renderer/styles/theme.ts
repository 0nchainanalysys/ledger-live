import { keyframes, css } from "styled-components";
import { Theme as UITheme } from "@ledgerhq/react-ui/styles/theme";

export const space = [0, 5, 10, 15, 20, 30, 40, 50, 70];
export const fontSizes = [8, 9, 10, 12, 13, 16, 18, 22, 32];
export const radii = [0, 4];
export const shadows = ["0 4px 8px 0 rgba(0, 0, 0, 0.03)"];

// Those fonts are now defined in global.css, this is just a mapping for styled-system
export const fontFamilies = {
  Inter: {
    ExtraLight: {
      weight: 100,
      style: "normal",
    },
    Light: {
      weight: 300,
      style: "normal",
    },
    Regular: {
      weight: 400,
      style: "normal",
    },
    Medium: {
      weight: 500,
      style: "normal",
    },
    SemiBold: {
      weight: 600,
      style: "normal",
    },
    Bold: {
      weight: 700,
      style: "normal",
    },
    ExtraBold: {
      weight: 800,
      style: "normal",
    },
  },
};
const colors = {
  transparent: "transparent",
  pearl: "#ff0000",
  alertRed: "#ea2e49",
  warning: "#f57f17",
  black: "#000000",
  dark: "#142533",
  separator: "#aaaaaa",
  fog: "#d8d8d8",
  gold: "#d6ad42",
  graphite: "#767676",
  grey: "#999999",
  identity: "#41ccb4",
  lightFog: "#eeeeee",
  sliderGrey: "#F0EFF1",
  lightGraphite: "#fafafa",
  lightGrey: "#f9f9f9",
  starYellow: "#FFD24A",
  orange: "#ffa726",
  positiveGreen: "rgba(102, 190, 84, 1)",
  greenPill: "#41ccb4",
  smoke: "#666666",
  wallet: "#8b80db",
  blueTransparentBackground: "rgba(138, 128, 219, 0.15)",
  pillActiveBackground: "rgba(138, 128, 219, 0.1)",
  lightGreen: "rgba(102, 190, 84, 0.1)",
  lightRed: "rgba(234, 46, 73, 0.1)",
  lightWarning: "rgba(245, 127, 23, 0.1)",
  white: "#ffffff",
  experimentalBlue: "#49479c",
  marketUp_western: "#66be54",
  marketDown_western: "#ea2e49",
  twitter: "#1b9df0",
};
export { colors };
const animationLength = "0.3s";
const easings = {
  outQuadratic: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
};
const fadeIn = keyframes`
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  `;
const fadeOut = keyframes`
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  `;
const fadeInGrowX = keyframes`
    0% {
      opacity: 0;
      transform: scaleX(0);
    }
    100% {
      opacity: 1;
      transform: scaleX(1);
    }
`;
const fadeInUp = keyframes`
    0% {
      opacity: 0;
      transform: translateY(66%);
    }
    100% {
      opacity: 1;
      transform: translateY(0%);
    }
  `;
const animations = {
  fadeIn: () => css`${fadeIn} ${animationLength} ${easings.outQuadratic} forwards`,
  fadeOut: () => css`${fadeOut} ${animationLength} ${easings.outQuadratic} forwards`,
  fadeInGrowX: () => css`${fadeInGrowX} 0.6s ${easings.outQuadratic} forwards`,
  fadeInUp: () => css`${fadeInUp} ${animationLength} ${easings.outQuadratic} forwards`,
};
const overflow = {
  x: css`
    overflow-y: hidden;
    overflow-x: scroll;
    will-change: transform;
    &:hover {
      --track-color: ${p => p.theme.colors.palette.text.shade30};
    }
  `,
  y: css`
    overflow-x: hidden;
    overflow-y: scroll;
    will-change: transform;
    &:hover {
      --track-color: ${p => p.theme.colors.palette.text.shade30};
    }
  `,
  yAuto: css`
    overflow-x: hidden;
    overflow-y: auto;
    will-change: transform;
    &:hover {
      --track-color: ${p => p.theme.colors.palette.text.shade30};
    }
  `,
  xy: css`
    overflow: scroll;
    will-change: transform;
    &:hover {
      --track-color: ${p => p.theme.colors.palette.text.shade30};
    }
  `,
  trackSize: 12,
};
type Font = {
  weight: number;
  style: string;
};
export type Theme = {
  sizes: {
    topBarHeight: number;
    sideBarWidth: number;
    drawer: {
      side: {
        big: {
          width: number;
        };
        small: {
          width: number;
        };
      };
      popin: {
        min: {
          height: number;
          width: number;
        };
        max: {
          height: number;
          width: number;
        };
      };
    };
  };
  radii: number[];
  fontFamilies: {
    [x: string]: {
      [x: string]: Font;
    };
  };
  fontSizes: number[];
  space: number[];
  shadows: string[];
  colors: {
    [x: string]: string;
  };
  animations: {
    [x: string]: (props: never) => unknown;
  };
  overflow: {
    [x: string]: unknown;
  };
};

export type MergedThemes = UITheme & Theme;

const theme: Theme = {
  sizes: {
    topBarHeight: 58,
    sideBarWidth: 230,
    drawer: {
      side: {
        big: {
          width: 580,
        },
        small: {
          width: 420,
        },
      },
      popin: {
        min: {
          height: 158,
          width: 462,
        },
        max: {
          height: 522,
          width: 622,
        },
      },
    },
  },
  radii,
  fontFamilies,
  fontSizes,
  space,
  shadows,
  colors,
  animations,
  overflow,
};
export default theme;
