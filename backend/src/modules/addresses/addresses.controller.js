import addressesService from './addresses.service.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export class AddressesController {
  list = async (req, res) => {
    const addresses = await addressesService.getUserAddresses(req.user.id);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Addresses retrieved successfully',
      data: { addresses },
    });
  };

  create = async (req, res) => {
    const address = await addressesService.createAddress(req.user.id, req.body);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Address saved successfully',
      data: { address },
    });
  };

  remove = async (req, res) => {
    await addressesService.deleteAddress(req.user.id, req.params.id);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Address removed successfully',
      data: { deleted: true },
    });
  };
}

export const addressesController = new AddressesController();
export default addressesController;
