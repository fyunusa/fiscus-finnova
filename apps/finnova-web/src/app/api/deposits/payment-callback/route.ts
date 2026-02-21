import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Payment callback handler for Toss Payments
 * Toss redirects here after payment attempt (success or failure)
 * Then we redirect back to the deposits page with the payment result
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    console.log('📥 Payment callback received:', { paymentKey, orderId, amount });

    if (!paymentKey || !orderId || !amount) {
      console.error('❌ Missing required parameters');
      return NextResponse.redirect(
        new URL('/dashboard/deposits?payment=failed&reason=missing_params', request.url)
      );
    }

    // Store the payment details to be retrieved by the deposits page
    // NOTE: In a real app, you might want to store this in a database or Redis
    // For now, we'll pass it back to the client
    
    // Redirect back to deposits page with payment details as query params
    const redirectUrl = new URL('/dashboard/deposits', request.url);
    redirectUrl.searchParams.set('payment', 'success');
    redirectUrl.searchParams.set('paymentKey', paymentKey);
    redirectUrl.searchParams.set('orderId', orderId);
    redirectUrl.searchParams.set('amount', amount);

    console.log('✅ Redirecting to success page with payment details');
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Payment callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/deposits?payment=failed&reason=callback_error', request.url)
    );
  }
}
