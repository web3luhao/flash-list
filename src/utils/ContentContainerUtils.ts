import { ViewStyle } from "react-native";
import { Dimension } from "recyclerlistview";
import { ContentStyle } from "../FlashListProps";

export interface ContentStyleExplicit {
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  backgroundColor?: string;
}

export const updateContentStyle = (
  contentStyle: ContentStyle,
  contentContainerStyleSource: ContentStyle | undefined
): ContentStyleExplicit => {
  const {
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    padding,
    paddingVertical,
    paddingHorizontal,
    backgroundColor,
  } = (contentContainerStyleSource ?? {}) as ViewStyle;
  contentStyle.paddingLeft = Number(
    paddingLeft || paddingHorizontal || padding || 0
  );
  contentStyle.paddingRight = Number(
    paddingRight || paddingHorizontal || padding || 0
  );
  contentStyle.paddingTop = Number(
    paddingTop || paddingVertical || padding || 0
  );
  contentStyle.paddingBottom = Number(
    paddingBottom || paddingVertical || padding || 0
  );
  contentStyle.backgroundColor = backgroundColor;
  return contentStyle as ContentStyleExplicit;
};

export const hasUnsupportedKeysInContentContainerStyle = (
  contentContainerStyleSource: ContentStyle | undefined
) => {
  const {
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    padding,
    paddingVertical,
    paddingHorizontal,
    backgroundColor,
    ...rest
  } = (contentContainerStyleSource ?? {}) as ViewStyle;
  return Object.keys(rest).length > 0;
};

/** Applies padding corrections to given dimension. Mutates the dim object that was passed and returns it. */
export const applyContentContainerInsetForLayoutManager = (
  dim: Dimension,
  contentContainerStyle: ViewStyle | undefined,
  horizontal: boolean
) => {
  const contentStyle = updateContentStyle({}, contentContainerStyle);
  if (horizontal) {
    dim.height =
      dim.height - (contentStyle.paddingTop + contentStyle.paddingBottom);
  } else {
    dim.width =
      dim.width - (contentStyle.paddingLeft + contentStyle.paddingRight);
  }
  return dim;
};
