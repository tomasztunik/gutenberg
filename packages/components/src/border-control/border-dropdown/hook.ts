/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import * as styles from '../styles';
import { useContextSystem, WordPressComponentProps } from '../../ui/context';
import { useCx } from '../../utils/hooks/use-cx';

import type { BorderDropdownProps } from '../types';

export function useBorderDropdown(
	props: WordPressComponentProps< BorderDropdownProps, 'div' >
) {
	const { className, colors, ...otherProps } = useContextSystem(
		props,
		'BorderDropdown'
	);

	// Generate class names.
	const cx = useCx();
	const classes = useMemo( () => {
		return cx( styles.BorderDropdown, className );
	}, [ className ] );

	const indicatorClassName = useMemo( () => {
		return cx( styles.BorderColorIndicator );
	}, [] );

	const popoverClassName = useMemo( () => {
		return cx( styles.BorderPopover );
	}, [] );

	const popoverControlsClassName = useMemo( () => {
		return cx( styles.BorderPopoverControls );
	}, [] );

	const resetButtonClassName = useMemo( () => {
		return cx( styles.ResetButton );
	}, [] );

	return {
		...otherProps,
		className: classes,
		colors,
		indicatorClassName,
		popoverClassName,
		popoverControlsClassName,
		resetButtonClassName,
	};
}
