/**
 * WordPress dependencies
 */
import { getBlockSupport } from '@wordpress/blocks';
import {
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalBorderBoxControl as BorderBoxControl,
	isDefinedBorder,
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
	const { borderColor, sideBorderColors, style } = props.attributes;
	return isDefinedBorder( style?.border ) || borderColor || sideBorderColors;
};

// The border color, style, and width are omitted so they get undefined. The
// border radius is separate and must retain its selection.
const resetBorder = ( { attributes = {}, setAttributes } ) => {
	const { style } = attributes;
	setAttributes( {
		borderColor: undefined,
		sideBorderColors: undefined,
		style: {
			...style,
			border: cleanEmptyObject( {
				radius: style?.border?.radius,
			} ),
		},
	} );
};

const resetBorderFilter = ( newAttributes ) => ( {
	...newAttributes,
	borderColor: undefined,
	sideBorderColors: undefined,
	style: {
		...newAttributes.style,
		border: {
			radius: newAttributes.style?.border?.radius,
		},
	},
} );

const getColorByProperty = ( colors, property, value ) => {
	let matchedColor;

	colors.some( ( origin ) =>
		origin.colors.some( ( color ) => {
			if ( color[ property ] === value ) {
				matchedColor = color;
				return true;
			}

			return false;
		} )
	);

	return matchedColor;
};

export const getMultiOriginColor = ( { colors, namedColor, customColor } ) => {
	// Search each origin (default, theme, or user) for matching color by name.
	if ( namedColor ) {
		const colorObject = getColorByProperty( colors, 'slug', namedColor );
		if ( colorObject ) {
			return colorObject;
		}
	}

	// Skip if no custom color or matching named color.
	if ( ! customColor ) {
		return { color: undefined };
	}

	// Attempt to find color via custom color value or build new object.
	const colorObject = getColorByProperty( colors, 'color', customColor );
	return colorObject ? colorObject : { color: customColor };
};

const getBorderObject = ( attributes, colors ) => {
	const {
		borderColor,
		sideBorderColors,
		style: { border: borderStyles },
	} = attributes;

	// If we have a named color for a flat border. Fetch that color object and
	// apply that color's value to the color property within the style object.
	if ( borderColor ) {
		const { color } = getMultiOriginColor( {
			colors,
			namedColor: borderColor,
		} );

		return color ? { ...borderStyles, color } : borderStyles;
	}

	// If we have named colors for the individual side borders, retrieve their
	// related color objects and apply the real color values to the split
	// border objects.
	if ( sideBorderColors ) {
		const hydratedBorderStyles = { ...borderStyles };

		Object.entries( sideBorderColors ).forEach(
			( [ side, namedColor ] ) => {
				const { color } = getMultiOriginColor( { colors, namedColor } );

				if ( color ) {
					hydratedBorderStyles[ side ] = {
						...hydratedBorderStyles[ side ],
						color,
					};
				}
			}
		);

		return hydratedBorderStyles;
	}

	// No named colors selected all color values if any should already be in
	// the style's border object.
	return borderStyles;
};

export function BorderPanel( props ) {
	const { attributes, clientId, setAttributes } = props;
	const { style } = attributes;
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
		// Maintain radius when border is reset i.e. newBorder is undefined.
		const borderStyles = !! style?.border?.radius
			? { radius: style?.border?.radius, ...newBorder }
			: newBorder;

		let newBorderColor;
		let newSideBorderColors;

		if ( hasSplitBorders( borderStyles ) ) {
			newSideBorderColors = {};

			[ 'top', 'right', 'bottom', 'left' ].forEach( ( side ) => {
				if ( borderStyles[ side ]?.color ) {
					const colorObject = getMultiOriginColor( {
						colors,
						customColor: borderStyles[ side ]?.color,
					} );

					if ( colorObject.slug ) {
						// If we have a named color, set the sides named color
						// attribute and clear the saved style objects color value.
						newSideBorderColors[ side ] = colorObject.slug;
						borderStyles[ side ].color = undefined;
					} else {
						// If we no longer have a named color, clear the
						// side's named color attribute.
						newSideBorderColors[ side ] = undefined;
					}
				}
			} );
		} else if ( borderStyles?.color ) {
			// We have a flat border configuration. Apply named color slug to
			// `borderColor` attribute and clear color style property if found.
			const customColor = borderStyles?.color;
			const colorObject = getMultiOriginColor( { colors, customColor } );

			if ( colorObject.slug ) {
				newBorderColor = colorObject.slug;
				borderStyles.color = undefined;
			}
		}

		const newStyle = cleanEmptyObject( { ...style, border: borderStyles } );

		setAttributes( {
			style: newStyle,
			borderColor: newBorderColor,
			sideBorderColors: newSideBorderColors,
		} );
	};

	const hydratedBorder = getBorderObject( attributes, colors );

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
						value={ hydratedBorder }
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
