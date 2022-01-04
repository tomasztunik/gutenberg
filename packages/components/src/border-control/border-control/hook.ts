/**
 * WordPress dependencies
 */
import { useCallback, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import * as styles from '../styles';
import { parseUnit } from '../../unit-control/utils';
import { useContextSystem, WordPressComponentProps } from '../../ui/context';
import { useCx } from '../../utils/hooks/use-cx';

import type { Border, BorderControlProps } from '../types';

const sanitizeBorder = ( border: Border | undefined ) => {
	const hasNoWidth = border?.width === undefined || border.width === '';
	const hasNoColor = border?.color === undefined;

	// If width and color are undefined, unset any style selection as well.
	if ( hasNoWidth && hasNoColor ) {
		return undefined;
	}

	return border;
};

export function useBorderControl(
	props: WordPressComponentProps< BorderControlProps, 'div' >
) {
	const {
		className,
		isSmall,
		onChange,
		shouldSanitizeBorder = true,
		value: border,
		...otherProps
	} = useContextSystem( props, 'BorderControl' );

	const [ widthValue, originalWidthUnit ] = parseUnit( border?.width );
	const widthUnit = originalWidthUnit || 'px';

	const onBorderChange = useCallback(
		( newBorder: Border | undefined ) => {
			if ( shouldSanitizeBorder ) {
				return onChange( sanitizeBorder( newBorder ) );
			}

			onChange( newBorder );
		},
		[ onChange, shouldSanitizeBorder, sanitizeBorder ]
	);

	const onWidthChange = useCallback(
		( newWidth: string | undefined ) => {
			const newWidthValue = newWidth === '' ? undefined : newWidth;
			onBorderChange( { ...border, width: newWidthValue } );
		},
		[ border, onBorderChange ]
	);

	const onSliderChange = useCallback(
		( value: string ) => {
			onWidthChange( `${ value }${ widthUnit }` );
		},
		[ onWidthChange, widthUnit ]
	);

	// Generate class names.
	const cx = useCx();
	const classes = useMemo( () => {
		return cx( styles.BorderControl, className );
	}, [ className ] );

	const innerWrapperClassName = useMemo( () => {
		const smallStyle = isSmall && styles.SmallWrapper;
		return cx( styles.InnerWrapper, smallStyle );
	}, [ isSmall ] );

	const widthControlClassName = useMemo( () => {
		return cx( styles.BorderWidthControl );
	}, [] );

	const sliderClassName = useMemo( () => {
		return cx( styles.BorderSlider );
	}, [] );

	return {
		...otherProps,
		className: classes,
		innerWrapperClassName,
		onBorderChange,
		onSliderChange,
		onWidthChange,
		sliderClassName,
		value: border,
		widthControlClassName,
		widthUnit,
		widthValue,
	};
}
