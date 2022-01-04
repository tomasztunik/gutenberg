/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import BorderStyleControl from '../border-style-control';
import Button from '../../button';
// @ts-ignore
import ColorIndicator from '../../color-indicator';
// @ts-ignore
import ColorPalette from '../../color-palette';
import Dropdown from '../../dropdown';
import { HStack } from '../../h-stack';
import { VStack } from '../../v-stack';
import { contextConnect, WordPressComponentProps } from '../../ui/context';
import { useBorderDropdown } from './hook';
import { StyledLabel } from '../../base-control/styles/base-control-styles';

import type { BorderDropdownProps, BorderPopoverProps } from '../types';
const noop = () => undefined;

const BorderDropdown = (
	props: WordPressComponentProps< BorderDropdownProps, 'div' >,
	forwardedRef: React.Ref< any >
) => {
	const {
		__experimentalHasMultipleOrigins,
		__experimentalIsRenderedInSidebar,
		border,
		colors,
		disableCustomColors,
		enableAlpha,
		indicatorClassName,
		onChange,
		popoverClassName,
		popoverControlsClassName,
		resetButtonClassName,
		showStyle = true,
		...otherProps
	} = useBorderDropdown( props );

	const indicatorBorderStyles = {
		borderStyle: border?.style,
		borderColor: border?.color,
	};

	const renderToggle = ( { onToggle = noop } ) => (
		<Button
			onClick={ onToggle }
			variant="tertiary"
			aria-label={ __( 'Open border options' ) }
		>
			<span style={ indicatorBorderStyles }>
				<ColorIndicator
					className={ indicatorClassName }
					colorValue={ border?.color }
				/>
			</span>
		</Button>
	);

	const onColorChange = ( color: string | undefined ) => {
		onChange( { ...border, color } );
	};

	const onStyleChange = ( style: string | undefined ) => {
		onChange( { ...border, style } );
	};

	const renderContent = ( { onClose }: BorderPopoverProps ) => (
		<>
			<VStack className={ popoverControlsClassName } spacing={ 6 }>
				<HStack>
					<StyledLabel>{ __( 'Border color' ) }</StyledLabel>
					<Button
						isSmall
						label={ __( 'Close border color' ) }
						icon={ closeSmall }
						onClick={ onClose }
					/>
				</HStack>
				<ColorPalette
					className="test"
					value={ border?.color }
					onChange={ onColorChange }
					{ ...{ colors, disableCustomColors } }
					__experimentalHasMultipleOrigins={
						__experimentalHasMultipleOrigins
					}
					__experimentalIsRenderedInSidebar={
						__experimentalIsRenderedInSidebar
					}
					clearable={ false }
					enableAlpha={ enableAlpha }
				/>
				{ showStyle && (
					<BorderStyleControl
						label={ __( 'Style' ) }
						value={ border?.style }
						onChange={ onStyleChange }
					/>
				) }
				{ /* TODO: Add Border Style and change this to BorderPopover */ }
			</VStack>
			<Button
				className={ resetButtonClassName }
				variant="tertiary"
				onClick={ () => {
					onChange( {
						...border,
						color: undefined,
						style: undefined,
					} );
					onClose();
				} }
			>
				{ __( 'Reset to default' ) }
			</Button>
		</>
	);

	return (
		<Dropdown
			renderToggle={ renderToggle }
			renderContent={ renderContent }
			contentClassName={ popoverClassName }
			{ ...otherProps }
			ref={ forwardedRef }
		/>
	);
};

const ConnectedBorderDropdown = contextConnect(
	BorderDropdown,
	'BorderControl'
);

export default ConnectedBorderDropdown;
