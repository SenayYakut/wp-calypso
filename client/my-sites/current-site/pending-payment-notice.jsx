/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { hasPendingPayment } from 'lib/cart-values';

export const PendingPaymentNotice = ( { translate, cart = {} } ) => {
	if ( ! hasPendingPayment( cart ) ) {
		return null;
	}

	return (
		<Notice
			icon="info-outline"
			isCompact
			status="is-warning"
			text={ translate( 'Payment is pending', {
				comment: 'Notice to user that a payment is pending',
			} ) }
		>
			<NoticeAction href="/me/purchases/pending">
				{ translate( 'Complete', {
					comment: 'A button to click when you want to complete a pending payment',
				} ) }
			</NoticeAction>
		</Notice>
	);
};

export default localize( PendingPaymentNotice );
