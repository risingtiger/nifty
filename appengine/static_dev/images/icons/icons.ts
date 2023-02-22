export type IconsId =
  | "_01_arrowright1"
  | "_02_arrowright2"
  | "_03_checkcircle"
  | "_04_edit1"
  | "_05_edit2"
  | "_06_expand"
  | "_07_search"
  | "_08_stopwatch"
  | "_09_refresh"
  | "_10_location"
  | "_11_graph";

export type IconsKey =
  | "i01Arrowright1"
  | "i02Arrowright2"
  | "i03Checkcircle"
  | "i04Edit1"
  | "i05Edit2"
  | "i06Expand"
  | "i07Search"
  | "i08Stopwatch"
  | "i09Refresh"
  | "i10Location"
  | "i11Graph";

export enum Icons {
  i01Arrowright1 = "_01_arrowright1",
  i02Arrowright2 = "_02_arrowright2",
  i03Checkcircle = "_03_checkcircle",
  i04Edit1 = "_04_edit1",
  i05Edit2 = "_05_edit2",
  i06Expand = "_06_expand",
  i07Search = "_07_search",
  i08Stopwatch = "_08_stopwatch",
  i09Refresh = "_09_refresh",
  i10Location = "_10_location",
  i11Graph = "_11_graph",
}

export const ICONS_CODEPOINTS: { [key in Icons]: string } = {
  [Icons.i01Arrowright1]: "61697",
  [Icons.i02Arrowright2]: "61698",
  [Icons.i03Checkcircle]: "61699",
  [Icons.i04Edit1]: "61700",
  [Icons.i05Edit2]: "61701",
  [Icons.i06Expand]: "61702",
  [Icons.i07Search]: "61703",
  [Icons.i08Stopwatch]: "61704",
  [Icons.i09Refresh]: "61705",
  [Icons.i10Location]: "61706",
  [Icons.i11Graph]: "61707",
};
