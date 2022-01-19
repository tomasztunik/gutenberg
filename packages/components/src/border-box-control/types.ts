/**
 * Internal dependencies
 */
import type { Border, Color } from '../border-control/types';

export type Borders = {
	top?: Border;
	right?: Border;
	bottom?: Border;
	left?: Border;
};

export type AnyBorder = Border | Borders | undefined;
export type BorderProp = 'color' | 'style' | 'width';
export type BorderSide = 'top' | 'right' | 'bottom' | 'left';

export type BorderBoxControlProps = {
	/**
	 * The child elements.
	 */
	children: React.ReactNode;
	colors?: Color[];
	hideLabelFromVision?: boolean;
	label?: string;
	onChange: ( value: AnyBorder ) => void;
	showStyle?: boolean;
	value: AnyBorder;
	__experimentalHasMultipleOrigins?: boolean;
	__experimentalIsRenderedInSidebar?: boolean;
};

export type LinkedButtonProps = {
	isLinked: boolean;
	onClick: () => void;
};

export type BorderVisualizerProps = {
	value?: Borders;
};

export type SplitBorderControlProps = {
	colors?: Color[];
	onChange: ( value: Border | undefined, side: BorderSide ) => void;
	showStyle?: boolean;
	value?: Borders;
	__experimentalHasMultipleOrigins?: boolean;
	__experimentalIsRenderedInSidebar?: boolean;
};

export type BorderLabelProps = {
	label?: string;
	hideLabelFromVision?: boolean;
};
