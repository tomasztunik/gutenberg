/**
 * WordPress dependencies
 */
import { MenuGroup, MenuItem } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';

const ExistingMenusSelector = ( {
	showNavigationMenus,
	showClassicMenus = false,
	navigationMenus,
	classicMenus,
	onSelectNavigationMenu,
	onSelectClassicMenu,
	/* translators: %s: The name of a menu. */
	actionLabel = __( "Switch to '%s'" ),
} ) => {
	const hasNavigationMenus = !! navigationMenus?.length;
	const hasClassicMenus = !! classicMenus?.length;

	return (
		<>
			{ showNavigationMenus && hasNavigationMenus && (
				<MenuGroup label={ __( 'Menus' ) }>
					{ navigationMenus.map( ( menu ) => {
						const label = decodeEntities( menu.title.rendered );
						return (
							<MenuItem
								onClick={ () => {
									onSelectNavigationMenu( menu );
								} }
								key={ menu.id }
								aria-label={ sprintf( actionLabel, label ) }
							>
								{ label }
							</MenuItem>
						);
					} ) }
				</MenuGroup>
			) }
			{ showClassicMenus && hasClassicMenus && (
				<MenuGroup label={ __( 'Classic Menus' ) }>
					{ classicMenus.map( ( menu ) => {
						return (
							<MenuItem
								onClick={ () => {
									onSelectClassicMenu( menu );
								} }
								key={ menu.id }
							>
								{ decodeEntities( menu.name ) }
							</MenuItem>
						);
					} ) }
				</MenuGroup>
			) }
		</>
	);
};

export default ExistingMenusSelector;
