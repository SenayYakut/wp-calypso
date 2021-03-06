/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Children, Component } from 'react';
import { connect } from 'react-redux';
import { find, reduce } from 'lodash';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ProgressBar from 'components/progress-bar';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

export class ChecklistNavigation extends Component {
	static propTypes = {
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
		setStoredTask: PropTypes.func.isRequired,
		setNotification: PropTypes.func.isRequired,
		showNotification: PropTypes.bool,
		canShowChecklist: PropTypes.bool,
		closePopover: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
	};

	handleClick = () => {
		// The redux state for getSiteChecklist() is injected from an API response
		// so the selector's results and the task list will not always match
		// Therefore, we're accessing the child Tasks directly for accuracy

		const childrenArray = Children.toArray( this.props.children );
		const task = find( childrenArray, child => ! child.props.completed );

		if ( task ) {
			this.props.setStoredTask( task.key );
		}
		this.props.setNotification( false );
		this.props.closePopover();
		this.props.recordTracksEvent( 'calypso_inlinehelp_checklist_click' );
	};

	render() {
		const { siteSlug, translate, showNotification, children, canShowChecklist } = this.props;

		const buttonClasses = {
			'has-notification': showNotification,
			'checklist-navigation__count': true,
		};
		const childrenArray = Children.toArray( children );
		const total = childrenArray.length;
		const completeCount = reduce(
			childrenArray,
			( sum, child ) => ( !! child.props.completed ? sum + 1 : sum ),
			0
		);
		const isFinished = completeCount >= total;
		const checklistLink = '/checklist/' + siteSlug;

		if ( ! canShowChecklist || isFinished ) {
			return null;
		}

		return (
			<div className="checklist-navigation">
				<Button
					onClick={ this.handleClick }
					href={ checklistLink }
					className="checklist-navigation__button"
					borderless
				>
					<span className="checklist-navigation__label">
						{ translate( 'Continue Site Setup' ) }
					</span>

					<span className={ classNames( buttonClasses ) }>
						{ translate( '%(complete)d/%(total)d', {
							comment: 'Numerical progress indicator, like 5/9',
							args: {
								complete: completeCount,
								total: total,
							},
						} ) }
					</span>

					<div className="checklist-navigation__progress-bar-margin">
						<ProgressBar total={ total } value={ completeCount } compact />
					</div>
				</Button>
			</div>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		return {
			siteSlug: getSiteSlug( state, siteId ),
		};
	},
	{ recordTracksEvent }
)( localize( ChecklistNavigation ) );
