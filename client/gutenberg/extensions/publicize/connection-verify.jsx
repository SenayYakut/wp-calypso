/** @format */
/**
 * Publicize connections verification component.
 *
 * Component to create Ajax request to check
 * all connections. If any connection tests failed,
 * a refresh link may be provided to the user. If
 * no connection tests fail, this component will
 * not render anything.
 */

/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class PublicizeConnectionVerify extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			failedConnections: {},
			isLoading: false,
		};
	}

	/**
	 * Callback for connection test request
	 *
	 * Receives results of connection request and
	 * updates component state to display potentially
	 * failed connections.
	 *
	 * @param {object} response Response from '/publicize/connections' endpoint
	 */
	connectionTestComplete = response => {
		const failureList = response.data.filter( connection => ! connection.connectionTestPassed );
		this.setState( {
			failedConnections: failureList,
			isLoading: false,
		} );
	};

	/**
	 * Starts request to check connections
	 *
	 * Checks connections with using the '/publicize/connections' endpoint
	 */
	connectionTestStart = () => {
		apiFetch( {
			path: '/jetpack/v4/publicize/connections',
		} ).then( () => this.connectionTestComplete );
	};

	/**
	 * Opens up popup so user can refresh connection
	 *
	 * Displays pop up with to specified URL where user
	 * can refresh a specific connection.
	 *
	 * @param {object} event Event instance for onClick.
	 */
	refreshConnectionClick = event => {
		const { href, title } = event.target;
		event.preventDefault();
		// open a popup window
		// when it is closed, kick off the tests again
		const popupWin = window.open( href, title, '' );
		window.setInterval( () => {
			if ( false !== popupWin.closed ) {
				this.connectionTestStart();
			}
		}, 500 );
	};

	componentDidMount() {
		this.connectionTestStart();
	}

	render() {
		const { failedConnections } = this.state;
		if ( failedConnections.length > 0 ) {
			return (
				<div className="below-h2 error publicize-token-refresh-message">
					<p key="error-title">
						{ __(
							'Before you hit Publish, please refresh the following connection(s) to make sure we can Publicize your post:'
						) }
					</p>
					{ failedConnections.filter( c => c.userCanRefresh ).map( c => (
						<a
							className="pub-refresh-button button"
							title={ c.refreshText }
							href={ c.refreshURL }
							target={ '_refresh_' + c.serviceName }
							onClick={ this.refreshConnectionClick }
							key={ c.connectionID }
						>
							{ c.refreshText }
						</a>
					) ) }
				</div>
			);
		}
		return null;
	}
}

export default PublicizeConnectionVerify;
