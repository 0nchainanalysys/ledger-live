type Props = {
  value: string;
  modal?: string;
};

export function getTrackProperties({ value, modal = "stake" }: Props) {
  return {
    page: window.location.hash
      .split("/")
      .filter(e => e !== "#")
      .join("/"),
    modal,
    flow: "stake",
    value,
  };
}
