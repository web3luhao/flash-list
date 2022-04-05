import {
  Dimension,
  GridLayoutProvider,
  Layout,
  LayoutManager,
} from "recyclerlistview";

import { FlashListProps } from "./FlashList";
import { AverageWindow } from "./utils/AverageWindow";

export default class GridLayoutProviderWithProps<T> extends GridLayoutProvider {
  private props: FlashListProps<T>;
  private layoutObject = { span: undefined, size: undefined };

  private averageWindow: AverageWindow;

  constructor(
    maxSpan: number,
    getLayoutType: (
      index: number,
      props: FlashListProps<T>,
      mutableLayout: { span?: number; size?: number }
    ) => string | number,
    getSpan: (
      index: number,
      props: FlashListProps<T>,
      mutableLayout: { span?: number; size?: number }
    ) => number,
    getHeightOrWidth: (
      index: number,
      props: FlashListProps<T>,
      mutableLayout: { span?: number; size?: number }
    ) => number | undefined,
    props: FlashListProps<T>,
    acceptableRelayoutDelta?: number
  ) {
    super(
      maxSpan,
      (i) => {
        return getLayoutType(i, this.props, this.getCleanLayoutObj());
      },
      (i) => {
        return getSpan(i, this.props, this.getCleanLayoutObj());
      },
      (i) => {
        return (
          getHeightOrWidth(i, this.props, this.getCleanLayoutObj()) ??
          this.averageItemSize
        );
      },
      acceptableRelayoutDelta
    );
    this.props = props;
    this.averageWindow = new AverageWindow(1, props.estimatedItemSize);
  }

  public updateProps(props: FlashListProps<T>) {
    this.props = props;
  }

  // Calling this method will help the layout provider track average item sizes on it's own
  // Overriding layout manager can help achieve the same thing without relying on this method being called however, it will make implementation very complex for a simple use case
  public reportItemLayout(index: number) {
    const layout = this.getLayoutManager()?.getLayouts()[index];
    if (layout) {
      this.averageWindow.addValue(
        this.props.horizontal ? layout.width : layout.height
      );
    }
  }

  // API for future use cases and testing
  public get averageItemSize() {
    return this.averageWindow.currentValue;
  }

  public newLayoutManager(
    renderWindowSize: Dimension,
    isHorizontal?: boolean,
    cachedLayouts?: Layout[]
  ): LayoutManager {
    // Average Window is update whenever a new layout manager is created. This is because old values are not relevant anymore.
    const estimatedItemCount = Math.round(
      (this.props.horizontal
        ? renderWindowSize.width
        : renderWindowSize.height) / this.props.estimatedItemSize
    );
    this.averageWindow = new AverageWindow(
      2 * (this.props.numColumns || 1) * estimatedItemCount,
      this.props.estimatedItemSize
    );

    // Cached layouts lead to some visible resizing on orientation change when Grid Layout Provider is used. Ignoring caches.
    // This won't hurt performance much and is only used while resizing.
    return super.newLayoutManager(renderWindowSize, isHorizontal);
  }

  private getCleanLayoutObj() {
    this.layoutObject.size = undefined;
    this.layoutObject.span = undefined;
    return this.layoutObject;
  }
}
