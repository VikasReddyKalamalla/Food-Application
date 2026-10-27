import paymentsService from './payments.service.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export class PaymentsController {
  initiate = async (req, res) => {
    const payment = await paymentsService.initiatePayment(
      req.body.orderId,
      req.body.method,
      req.user
    );
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Payment initiated',
      data: { payment },
    });
  };

  webhook = async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const result = await paymentsService.handleWebhook(req.rawBody || JSON.stringify(req.body), signature, req.body);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Webhook processed',
      data: result,
    });
  };

  refund = async (req, res) => {
    const payment = await paymentsService.processRefund(
      req.params.id,
      req.body.amount,
      req.user
    );
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Refund processed successfully',
      data: { payment },
    });
  };
}

export const paymentsController = new PaymentsController();
export default paymentsController;
