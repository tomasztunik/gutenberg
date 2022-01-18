/**
 * WordPress dependencies
 */
import { getBlockSupport } from '@wordpress/blocks';
import {
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalBorderBoxControl as BorderBoxControl,
	isEmptyBorder,
	hasSplitBorders,
} from '@wordpress/components';
import { Platform } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	BorderRadiusEdit,
	hasBorderRadiusValue,
	resetBorderRadius,
} from './border-radius';
import InspectorControls from '../components/inspector-controls';
import useMultipleOriginColorsAndGradients from '../components/colors-gradients/use-multiple-origin-colors-and-gradients';
import useSetting from '../components/use-setting';
import { cleanEmptyObject } from './utils';

export const BORDER_SUPPORT_KEY = '__experimentalBorder';

const hasBorderValue = ( props ) => {
	const border = props.attributes.style?.border;

	// No border, no worries :)
	if ( ! border ) {
		return false;
	}

	// If we have individual borders per side within the border object we
	// need to check whether any of those side borders have been set.
	if ( hasSplitBorders( border ) ) {
		const allSidesEmpty = Object.keys( border ).every( ( side ) =>
			isEmptyBorder( border[ side ] )
		);

		return ! allSidesEmpty;
	}

	// If we have a top-level border only, check if that is empty. e.g.
	// { color: undefined, style: undefined, width: undefined }
	// Border radius can still be set within the border object as it is
	// handled separately.
	return ! isEmptyBorder( border );
};

// The border color, style, and width are omitted so the get undefined. The
// border radius is separate and must retain its selection.
const resetBorder = ( { attributes = {}, setAttributes } ) => {
	const { style } = attributes;
	setAttributes( {
		style: {
			...style,
			border: cleanEmptyObject( {
				radius: style?.border?.radius,
			} ),
		},
	} );
};

// TODO: Revisit this and check if it actually works as expected.
const resetBorderFilter = ( newAttributes ) => ( {
	...newAttributes,
	style: {
		...newAttributes.style,
		border: {
			radius: newAttributes.style?.border?.radius,
		},
	},
} );

export function BorderPanel( props ) {
	const {
		attributes: { style },
		clientId,
		setAttributes,
	} = props;
	const isDisabled = useIsBorderDisabled( props );
	const isSupported = hasBorderSupport( props.name );
	const { colors } = useMultipleOriginColorsAndGradients();

	const isColorSupported =
		useSetting( 'border.color' ) && hasBorderSupport( props.name, 'color' );

	const isRadiusSupported =
		useSetting( 'border.radius' ) &&
		hasBorderSupport( props.name, 'radius' );

	const isStyleSupported =
		useSetting( 'border.style' ) && hasBorderSupport( props.name, 'style' );

	const isWidthSupported =
		useSetting( 'border.width' ) && hasBorderSupport( props.name, 'width' );

	if ( isDisabled || ! isSupported ) {
		return null;
	}

	const defaultBorderControls = getBlockSupport( props.name, [
		BORDER_SUPPORT_KEY,
		'__experimentalDefaultControls',
	] );

	const showBorderByDefault =
		defaultBorderControls?.color || defaultBorderControls?.width;

	const onBorderChange = ( newBorder ) => {
		const newStyle = {
			...style,
			border: {
				...style?.border,
				...newBorder,
			},
		};

		setAttributes( { style: newStyle } );
	};

	return (
		<InspectorControls __experimentalGroup="border">
			{ ( isWidthSupported || isColorSupported ) && (
				<ToolsPanelItem
					hasValue={ () => hasBorderValue( props ) }
					label={ __( 'Border' ) }
					onDeselect={ () => resetBorder( props ) }
					isShownByDefault={ showBorderByDefault }
					resetAllFilter={ resetBorderFilter }
					panelId={ clientId }
				>
					<BorderBoxControl
						colors={ colors }
						onChange={ onBorderChange }
						showColor={ isColorSupported }
						showStyle={ isStyleSupported }
						showWidth={ isWidthSupported }
						value={ style?.border }
						__experimentalHasMultipleOrigins={ true }
						__experimentalIsRenderedInSidebar={ true }
					/>
				</ToolsPanelItem>
			) }
			{ isRadiusSupported && (
				<ToolsPanelItem
					hasValue={ () => hasBorderRadiusValue( props ) }
					label={ __( 'Radius' ) }
					onDeselect={ () => resetBorderRadius( props ) }
					isShownByDefault={ defaultBorderControls?.radius }
					resetAllFilter={ ( newAttributes ) => ( {
						...newAttributes,
						style: {
							...newAttributes.style,
							border: {
								...newAttributes.style?.border,
								radius: undefined,
							},
						},
					} ) }
					panelId={ clientId }
				>
					<BorderRadiusEdit { ...props } />
				</ToolsPanelItem>
			) }
		</InspectorControls>
	);
}

/**
 * Determine whether there is block support for border properties.
 *
 * @param {string} blockName Block name.
 * @param {string} feature   Border feature to check support for.
 *
 * @return {boolean} Whether there is support.
 */
export function hasBorderSupport( blockName, feature = 'any' ) {
	if ( Platform.OS !== 'web' ) {
		return false;
	}

	const support = getBlockSupport( blockName, BORDER_SUPPORT_KEY );

	if ( support === true ) {
		return true;
	}

	if ( feature === 'any' ) {
		return !! (
			support?.color ||
			support?.radius ||
			support?.width ||
			support?.style
		);
	}

	return !! support?.[ feature ];
}

/**
 * Check whether serialization of border classes and styles should be skipped.
 *
 * @param {string|Object} blockType Block name or block type object.
 *
 * @return {boolean} Whether serialization of border properties should occur.
 */
export function shouldSkipSerialization( blockType ) {
	const support = getBlockSupport( blockType, BORDER_SUPPORT_KEY );

	return support?.__experimentalSkipSerialization;
}

/**
 * Determines if all border support features have been disabled.
 *
 * @return {boolean} If border support is completely disabled.
 */
const useIsBorderDisabled = () => {
	const configs = [
		! useSetting( 'border.color' ),
		! useSetting( 'border.radius' ),
		! useSetting( 'border.style' ),
		! useSetting( 'border.width' ),
	];

	return configs.every( Boolean );
};

/**
 * Returns a new style object where the specified border attribute has been
 * removed.
 *
 * @param {Object} style     Styles from block attributes.
 * @param {string} attribute The border style attribute to clear.
 *
 * @return {Object} Style object with the specified attribute removed.
 */
export function removeBorderAttribute( style, attribute ) {
	return cleanEmptyObject( {
		...style,
		border: {
			...style?.border,
			[ attribute ]: undefined,
		},
	} );
}
