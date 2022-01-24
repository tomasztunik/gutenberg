/**
 * WordPress dependencies
 */
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';

const ExistingMenusSelector = ( {
	showNavigationMenus,
	navigationMenus,
	onFinish,
	menus,
	onCreateFromMenu,
	showClassicMenus = false,
} ) => {
	const hasNavigationMenus = !! navigationMenus?.length;
	const hasClassicMenus = !! menus?.length;

	return (
		<>
			{ showNavigationMenus && hasNavigationMenus && (
				<MenuGroup label={ __( 'Menus' ) }>
					{ navigationMenus.map( ( menu ) => {
						return (
							<MenuItem
								onClick={ () => {
									onFinish( menu );
								} }
								// onClose={ onClose }
								key={ menu.id }
							>
								{ decodeEntities( menu.title.rendered ) }
							</MenuItem>
						);
					} ) }
				</MenuGroup>
			) }
			{ showClassicMenus && hasClassicMenus && (
				<MenuGroup label={ __( 'Classic Menus' ) }>
					{ menus.map( ( menu ) => {
						return (
							<MenuItem
								onClick={ () => {
									onCreateFromMenu( menu.id, menu.name );
								} }
								// onClose={ onClose }
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
