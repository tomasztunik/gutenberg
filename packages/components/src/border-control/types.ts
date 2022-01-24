export type Border = {
	color?: string;
	style?: string;
	width?: string;
};

export type Color = {
	name: string;
	color: string;
};

export type BorderControlProps = {
	colors?: Color[];
	hideLabelFromVision?: boolean;
	isSmall?: boolean;
	label?: string;
	onChange: ( value: Border | undefined ) => void;
	shouldSanitizeBorder?: boolean;
	showStyle?: boolean;
	value?: Border;
	width?: string;
	withSlider?: boolean;
	__experimentalHasMultipleOrigins?: boolean;
	__experimentalIsRenderedInSidebar?: boolean;
};

export type BorderDropdownProps = {
	__experimentalHasMultipleOrigins?: boolean;
	__experimentalIsRenderedInSidebar?: boolean;
	border?: Border;
	colors?: Color[];
	disableCustomColors?: boolean;
	enableAlpha?: boolean;
	onChange: ( newBorder: Border | undefined ) => void;
	showStyle?: boolean;
};

export type BorderPopoverProps = {
	onClose: () => void;
};

export type BorderLabelProps = {
	label?: string;
	hideLabelFromVision?: boolean;
};

export type BorderStyleControlProps = {
	hideLabelFromVision?: boolean;
	label?: string;
	value?: string;
	onChange: ( style: string | undefined ) => void;
};
